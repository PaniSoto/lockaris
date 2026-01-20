import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const credentials = await prisma.credential.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const processedItems = credentials.map((item) => {
      try {
        // Desencriptar logins
        if (item.type === "LOGIN" && item.encryptedPassword) {
          return {
            ...item,
            password: decrypt(item.encryptedPassword, item.iv),
          };
        }

        // Desencriptar tarjetas
        if (item.type === "CARD" && item.encryptedCardNumber) {
          return {
            ...item,
            cardNumber: decrypt(item.encryptedCardNumber, item.iv),
            cvv: item.encryptedCvv ? decrypt(item.encryptedCvv, item.iv) : "",
          };
        }

        // Desencriptar notas seguras
        if (item.type === "NOTE" && item.notes) {
          return {
            ...item,
            notes: decrypt(item.notes, item.iv),
          };
        }

        return item;
      } catch (error) {
        console.error(`Error al desencriptar item ${item.id}:`, error);
        return { ...item, error: "Error de desencriptación" };
      }
    });

    return NextResponse.json(processedItems);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    return NextResponse.json(
      { message: "Error al obtener datos" },
      { status: 500 },
    );
  }
}

// POST: Se crean nuevas credenciales
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { type, serviceName, notes, url } = body;

    if (!serviceName) {
      return NextResponse.json(
        { message: "El nombre es obligatorio" },
        { status: 400 },
      );
    }

    let dataToSave = {
      type: type || "LOGIN",
      serviceName,
      url: url || null,
      userId: session.user.id,
    };

    // Dependiendo del tipo de dato, se encriptan y guardan los datos correspondientes

    if (type === "CARD") {
      const { cardholderName, cardNumber, expiryDate, cvv } = body;
      const { iv, encryptedData: encCard } = encrypt(cardNumber);
      const { encryptedData: encCvv } = encrypt(cvv, iv);

      dataToSave = {
        ...dataToSave,
        cardholderName,
        encryptedCardNumber: encCard,
        encryptedCvv: encCvv,
        expiryDate,
        iv,
        notes: notes || null, // Las notas en tarjetas suelen ser opcionales y planas
      };
    } else if (type === "NOTE") {
      // Para las notas seguras se encripta el campo 'notes'
      const { iv, encryptedData } = encrypt(notes || "");

      dataToSave = {
        ...dataToSave,
        notes: encryptedData,
        iv,
      };
    } else {
      // Lógica del login
      const { username, password } = body;
      if (!username || !password) {
        return NextResponse.json(
          { message: "Faltan datos de login" },
          { status: 400 },
        );
      }

      const { iv, encryptedData } = encrypt(password);
      dataToSave = {
        ...dataToSave,
        username,
        encryptedPassword: encryptedData,
        iv,
        notes: notes || null,
      };
    }

    const nuevaCredencial = await prisma.credential.create({
      data: dataToSave,
    });
    return NextResponse.json(nuevaCredencial, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/credentials:", error);
    return NextResponse.json({ message: "Error al guardar" }, { status: 500 });
  }
}
