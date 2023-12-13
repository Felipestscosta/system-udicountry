// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { name, phone } = req.body;
    const nameToLower = name.toLowerCase()

    const client = await prisma.client.create({
      data: {
        name: nameToLower,
        phone,
      },
    });

    return res.status(201).json(client);
  }

  if(req.method === "GET"){
    const clients = await prisma.client.findMany();

    return res.status(200).json(clients);
  }
}
