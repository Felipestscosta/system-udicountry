import { prisma } from "@/lib/prisma"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const limit = req.query.limit
    const pageNumber = req.query.pageNumber

    if (limit === "true") {
      // const totalOrders = await prisma.order.count()
      const perPage = 21
      // let numberPages = totalOrders / 20;
      let valueSkip = perPage * Number(pageNumber)

      var orders = await prisma.order.findMany({
        include: {
          client: true,
          service: true,
        },
        skip: valueSkip,
        take: perPage,
        where: { active: true },
      })
    } else {
      var orders = await prisma.order.findMany({
        // where: { active: true },
        include: {
          client: true,
          service: true,
        },
      })
    }

    return res.status(200).json(orders)
  }

  if (req.method === "POST") {
    const { clientId, output } = req.body

    const orderCount = (await prisma.order.count()) + 1

    const convertedOutputDate = new Date(output).toISOString()

    const order = await prisma.order.create({
      data: {
        number: orderCount,
        clientId: clientId.toString(),
        active: true,
        output: convertedOutputDate,
      },
    })

    return res.status(201).json(order)
  }

  if (req.method === "DELETE") {
    const orderId = req.query.orderId

    await prisma.order.delete({
      where: {
        id: orderId?.toString(),
      },
    })

    return res.status(200).json("Order deletado")
  }

  if (req.method === "PUT") {
    const { orderId, enterValue, total } = req.body

    const isFinishOrder = req.body.active

    if (isFinishOrder !== undefined) {
      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          active: isFinishOrder,
        },
      })
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        enter_value: enterValue,
        total: total,
      },
    })

    return res.status(201).json({ order })
  }
}
