import Image from "next/image"

import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import ptBR from "date-fns/locale/pt-BR"
import { format } from "date-fns"

import ScanCode from "../../components/scancode"
import { useRouter } from "next/router"
import { ArrowPathIcon } from "@heroicons/react/24/solid"
import { useEffect, useState } from "react"
import { api } from "@/lib/axios"

export interface serviceProps {
  created_at: string
  delivery: string
  value: number
}

export interface ordersProps {
  id: string
  number: number
  active: boolean
  total: number
  output: Date
  client: { name: string; phone: string }
}

interface arrayOrdersProps {
  orders: Array<ordersProps>
}

export default function App() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAllOrders, setIsAllOrders] = useState(true)
  const [isTodayFilterOrderActive, setIsTodayFilterOrderActive] =
    useState(false)
  const [isFinishedOutputActive, setIsFinishedOutputActive] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<ordersProps[]>([])

  // Paginacao
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  async function handleSearch(wordSearch: any) {
    // No paginate
    setHasMore(false)

    if (
      wordSearch.length === 0 ||
      wordSearch === undefined ||
      wordSearch === ""
    ) {
      setHasMore(true)
      await api
        .get("/orders?limit=true&pageNumber=0")
        .then((orders: any) => setFilteredOrders(orders.data))

      setIsAllOrders(true)
      setIsTodayFilterOrderActive(false)
      setIsFinishedOutputActive(false)
      setIsLoading(false)
    } else {
      api.get("/orders?limit=false").then((orders: any) => {
        const ordersFiltered = orders.data.filter((order: any) => {
          const client = order.client
          const totalPrice = order.total / 100
          const formatedTotalPrice = totalPrice.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })

          return (
            client.name.includes(wordSearch.toLowerCase()) ||
            client.phone.includes(wordSearch) ||
            formatedTotalPrice ===
              Number(wordSearch.replace(",", "") / 100).toLocaleString(
                "pt-BR",
                {
                  style: "currency",
                  currency: "BRL",
                }
              )
          )
        })

        setFilteredOrders(ordersFiltered)
        setIsLoading(false)
      })
    }
  }

  async function handleFilterByFinish() {
    // No paginate
    setHasMore(false)

    const orders = await api.get("/orders?limit=false")
    const ordersFinished = orders.data
    const ordersFilteredByFinish = await ordersFinished.filter(
      (order: ordersProps) => {
        return order.active === false
      }
    )
    setFilteredOrders(ordersFilteredByFinish)
    setIsAllOrders(false)
    setIsTodayFilterOrderActive(false)
    setIsFinishedOutputActive(true)
    setIsLoading(false)
  }

  async function handleByToday() {
    // No paginate
    setHasMore(false)

    setIsLoading(true)
    const ordersByToday = await api.get("/orders?limit=false")
    const orders = ordersByToday.data
    const currentDate = new Date()
    const formatedCurrentDate = format(currentDate, "yyyy-MM-dd")

    const currentDateOrders = orders.filter((order: ordersProps) => {
      const orderDate = new Date(order.output)
      const formatedOrderDate = format(orderDate, "yyyy-MM-dd")
      return formatedOrderDate === formatedCurrentDate
    })

    if (currentDateOrders.length !== 0) {
      setFilteredOrders(currentDateOrders)
      setIsAllOrders(false)
      setIsFinishedOutputActive(false)
      setIsTodayFilterOrderActive(true)
      setIsLoading(false)
    } else {
      setFilteredOrders([])
      setIsAllOrders(false)
      setIsFinishedOutputActive(false)
      setIsTodayFilterOrderActive(true)
      setIsLoading(false)
    }
  }

  const fetchItems = async (pageNumber: number) => {
    const response = await api.get(
      `/orders?limit=true&pageNumber=${pageNumber}`
    )
    const data = await response.data
    if (data.length > 0) {
      setFilteredOrders((orders) => [...orders, ...data])
      setHasMore(true)
    } else {
      setHasMore(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100 &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1)
        setHasMore(false)
      }
    }

    // Adiciona um ouvinte de evento de rolagem apenas se o ambiente permitir
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll)

      return () => {
        window.removeEventListener("scroll", handleScroll)
      }
    }
  })

  useEffect(() => {
    fetchItems(page)
  }, [page])

  return (
    <>
      <main className="flex flex-col h-full min-h-screen relative bg-gray-50 px-4 pb-12">
        <div className="flex flex-col fixed w-screen justify-center items-center p-8 pb-2 pt-4 left-0 z-10 bg-gray-50 shadow-lg rounded-b-2xl">
          <div className="flex relative w-full">
            <input
              className="rounded-full w-full px-16 py-2 outline-none h-14 shadow-lg"
              type="text"
              placeholder="Nome do cliente, Nº serviço..."
              onChange={(e) => {
                handleSearch(e.target.value)
              }}
            />
            <MagnifyingGlassIcon className="absolute left-6 top-4 h-6 text-gray-400" />
          </div>

          <div className="flex gap-4 my-3 items-center justify-center">
            <button
              className={`${
                isAllOrders ? "text-gray-950 font-bold" : "text-gray-500"
              }`}
              onClick={() => {
                handleSearch("")
                setIsLoading(true)
              }}
            >
              Todos
            </button>
            <span className="text-gray-300">|</span>
            <button
              className={`${
                isTodayFilterOrderActive
                  ? "text-gray-950 font-bold"
                  : "text-gray-500"
              }`}
              onClick={() => {
                handleByToday()
              }}
            >
              Hoje
            </button>
            <span className="text-gray-300">|</span>
            <button
              className={`${
                isFinishedOutputActive
                  ? "text-gray-950 font-bold"
                  : "text-gray-500"
              }`}
              onClick={() => {
                handleFilterByFinish()
                setIsLoading(true)
              }}
            >
              Entregues
            </button>
          </div>
        </div>

        <div className="flex flex-col min-h-screen justify-center">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col w-full justify-center items-center text-center gap-6">
              <ExclamationTriangleIcon className="h-32 text-gray-300" />
              <p className="w-60 text-lg font-medium text-gray-300">
                Nenhum serviço com a <strong>data de hoje</strong>, foi
                encontrado.{" "}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col w-full justify-center items-center text-center gap-6">
              <ArrowPathIcon className="h-32 text-gray-300 animate-spin" />
              <p className="w-60 text-lg font-medium text-gray-300">
                Carrengando serviços...{" "}
              </p>
            </div>
          ) : (
            filteredOrders.map((order: any, index: number) => {
              const services = order.service
              let totalValue = 0
              services.map((service: serviceProps) => {
                totalValue += service.value
              })

              let formatedValue = totalValue / 100
              const featureImage = services[0]?.image

              return (
                <div
                  key={index}
                  className={`flex relative items-center justify-center rounded-3xl mb-8 ${
                    index === 0 ? "mt-48" : null
                  }  overflow-hidden ${
                    order.active
                      ? "bg-amber-950"
                      : "bg-gray-600 line-through text-gray-400 opacity-70"
                  } cursor-pointer`}
                  onClick={() => {
                    setIsLoading(true)
                    router.push(`/service-orders/${order.id}`)
                  }}
                >
                  {featureImage !== "" ? (
                    <Image
                      className="object-cover rounded-3xl absolute z-0 opacity-20 blur-['40']"
                      alt=""
                      src={featureImage}
                      width={450}
                      height={170}
                      style={{ width: "100%", height: "auto" }}
                    />
                  ) : null}
                  <div className="relative p-10 mx-auto w-full z-2">
                    <h3 className="text-zinc-200 font-bold text-3xl capitalize mb-6">
                      {order.client.name}
                    </h3>
                    <hr className="mb-4 opacity-30 border-zinc-300" />
                    <div className="grid grid-cols-2">
                      <p className="text-zinc-200 text-2xl">
                        {format(new Date(order.output), "dd MMM", {
                          locale: ptBR,
                        })}
                      </p>
                      <p className="text-zinc-200 text-2xl text-right">
                        {formatedValue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
      <ScanCode />
    </>
  )
}

// export const getServerSideProps: GetServerSideProps = async () => {
//   const orders = await prisma.order.findMany({
//     // where: { active: true },
//     include: {
//       client: true,
//       service: true,
//     },
//     skip: 50,
//     take: 51,
//   })

//   const dataOrders = orders.map((order) => {
//     return {
//       id: order.id,
//       nome: order.client.name,
//       data: order.output.toISOString(),
//       active: order.active,
//       featureImage: order.service[0]?.image ?? "",
//       services: JSON.stringify(order.service),
//       number: order.number,
//       phone: order.client.phone,
//       total: order.total,
//     }
//   })

//   return {
//     props: {
//       orders: dataOrders,
//     },
//   }
// }
