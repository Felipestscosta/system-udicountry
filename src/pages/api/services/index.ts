import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest,res: NextApiResponse) {

  if (req.method === "GET") {
    const orderId = req.query.orderId;

    const services = await prisma.service.findMany({
      where: {
        orderId: orderId?.toString()
      }
    })

    return res.status(200).json(JSON.stringify(services))
  }
  
  if (req.method === "POST") {
    const { value, amount, description, orderId, image } = req.body;  
    const convertedValue = Number(value.replace(/[^0-9]/g, ''));
    const convertedAmount = Number(amount);

    const service = await prisma.service.create({
      data: {
        value: convertedValue,
        amount: convertedAmount,
        description,
        image,
        orderId: orderId,
        pay: true
      },
    });

    return res.status(201).json(service);
  }

  if (req.method === "DELETE") {
    const orderId = req.query.orderId;

    await prisma.service.deleteMany({
      where: {
        orderId: orderId?.toString()
      }
    })

    return res.status(200).json("Serviço deletado");
  }
}
