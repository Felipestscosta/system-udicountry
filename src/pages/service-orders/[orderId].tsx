import Header from "@/components/header";
import ScanCode from "@/components/scancode";
import { api } from "@/lib/axios";
import { prisma } from "@/lib/prisma";
import {
  ArrowPathIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckIcon,
  PhoneArrowUpRightIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

interface serviceProp {
  value: number;
  description: string;
  image: string;
  amount: number;
}

export default function ServiceOrdersDetails({ order, services }: any) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [currentImageOpen, setCurrentImageOpen] = useState("");

  const orderFormated = JSON.parse(order);

  const totalValueFormated = orderFormated.total / 100;
  const enterValueFormated = orderFormated.enter_value / 100;
  const remainingValueFormated =
    (orderFormated.total - orderFormated.enter_value) / 100;

  async function handleFinishOrder() {
    setIsLoading(true);

    try {
      const confirm = window.confirm("Tem certeza que deseja finalizar?");
      if (confirm) {
        await api
          .put("/orders", { orderId: orderFormated.id, active: false })
          .then((data) => {
            // router.push("/");
            setIsLoading(false);
          });
      }
    } catch (err) {
      setIsLoading(false);
      console.log("Erro: ", err);
    }
  }

  const handleRemoveOrder = async () => {
    setIsLoading(true);

    try {
      const confirm = window.confirm("Tem certeza que deseja remover?");

      if (confirm) {

        await api.delete(`/services?orderId=${orderFormated.id}`).then(() => {
          api.delete(`/orders?orderId=${orderFormated.id}`).then(() => {
            setIsLoading(false);
            router.push("/service-orders");
          });
        });
        
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  return (
    <>
    {isLoading &&
          <div className="flex w-full h-full justify-center items-center fixed bg-amber-950 z-40 opacity-80">
            <ArrowPathIcon className="h-10 animate-spin text-white"/>
          </div>
        }
    <div className="h-full bg-gray-100 pb-16">
      
      <Header Title={`Nº do Pedido: ${orderFormated.number}`} />
      <div className="flex flex-col px-8 pt-28">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex relative gap-4 items-center justify-center text-center p-2 py-6 pt-9 rounded-lg border border-gray-300 bg-transparent">
            <div className="absolute -top-6 p-3 bg-gray-800 rounded-full">
              <CalendarIcon className="h-5 text-white" />
            </div>
            <div className="flex flex-col gap-y-0">
              <h3>
                {format(new Date(orderFormated.created_at), "dd 'de' MMM", {
                  locale: ptBR,
                })}
              </h3>
              <span>
                <hr className="my-1"/>
              </span>
              <h3 className="text-lg font-extrabold">
                {format(new Date(orderFormated.output), "dd 'de' MMM", {
                  locale: ptBR,
                })}
              </h3>
            </div>
          </div>

          <div className="flex relative gap-4 items-center justify-center p-2 py-6 pt-9 rounded-lg bg-transparent border border-gray-300">
            <div className="absolute -top-6  p-3 bg-gray-800 rounded-full">
              <BanknotesIcon className="h-5 text-white" />
            </div>
            <div className="flex flex-col text-left gap-y-0">
                <h3>
                  {totalValueFormated.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h3>{" "}
                <h3 className="text-gray-400 line-through">
                  {" "}
                  -{" "}
                  {enterValueFormated.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h3>
              {remainingValueFormated === 0 ? (
                <h3 className="flex items-center justify-center gap-1 text-lg text-green-500 font-bold">
                  <CheckIcon className="h-5" /> Pago
                </h3>
              ) : (
                <h3 className="text-lg text-gray-800 font-bold">
                  {remainingValueFormated.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </h3>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full mb-16 bg-white shadow-lg z-10 rounded-lg text-center">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col p-4 pl-8 text-left">
              <h3 className="capitalize text-xl font-bold">
                {orderFormated.client.name}
              </h3>
              <p>{orderFormated.client.phone}</p>
            </div>
            <div className="flex w-fit text-right">
              <Link
                href={`tel:+${orderFormated.client.phone.replace(/[^0-9]/g, "")}`}
                className="flex gap-1 bg-green-500 text-white p-4 mr-6 rounded-full shadow-lg"
              >
                <PhoneArrowUpRightIcon className="h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col  gap-8">
          {services.map((service: serviceProp, index: number) => {
            let formatedIndividualValue = service.value / 100;
            return (
              <div
                className="flex flex-col w-fit relative items-center justify-center text-center bg-white rounded-lg shadow-xl mb-12"
                key={index}
              >
                <Image
                  className="h-80 rounded-t-lg cursor-pointer"
                  width={500}
                  height={500}
                  style={{ objectFit: "cover" }}
                  src={service.image}
                  alt=""
                  onClick={() => setCurrentImageOpen(service.image)}
                />
                <div className="flex flex-col gap-4 bg-gradient-to-br bg-white p-8 rounded-b-lg">
                  <span className="flex absolute h-12 w-12 -top-5 -right-2 justify-center items-center bg-red-700 text-white text-2xl font-bold p-3 rounded-full">
                    {service.amount}
                  </span>
                  <p className="text-lg text-gray-800">{service.description}</p>
                  <p className="text-2xl text-gray-800 font-bold">
                    {formatedIndividualValue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Zoom da imagem */}
      <div
        className={`${
          currentImageOpen !== "" ? "flex" : "hidden"
        } fixed w-screen h-screen items-center justify-center top-0 z-50 bg-gray-950`}
      >
        <button
          type="button"
          onClick={() => setCurrentImageOpen("")}
          className="fixed border-none right-4 top-4"
        >
          <XMarkIcon className="h-10 text-gray-200" />
        </button>

        <Image
          className="h-auto"
          width={500}
          height={500}
          style={{ objectFit: "contain" }}
          src={currentImageOpen}
          alt=""
        />
      </div>

      <div className="flex w-full fixed bottom-0 justify-between z-40">
        <button
          className="font-medium w-full  flex justify-center items-center gap-1 bg-green-500 text-white px-6 py-4"
          onClick={() => {
            handleFinishOrder();
          }}
          disabled={orderFormated.active ? false : true}
        >
          <CheckIcon className="h-4" /> Entregar
        </button>
        <button
          className="font-medium w-full flex justify-center items-center gap-1 bg-red-500 text-white px-6 py-4"
          onClick={() => {
            handleRemoveOrder();
          }}
        >
          <TrashIcon className="h-4" /> Deletar
        </button>
      </div>

      {/* <ScanCode /> */}
    </div>
    </>
  );
}

export const getServerSideProps = async (context: {
  params: { orderId: string };
}) => {
  const orderId = context.params.orderId;

  const services = await prisma.service.findMany({
    where: {
      orderId: orderId,
    },
  });

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      client: true,
    },
  });

  const dataServices = services.map((service) => {
    return {
      description: service.description,
      value: service.value,
      image: service.image,
      amount: service.amount,
    };
  });

  return {
    props: {
      services: dataServices,
      order: JSON.stringify(order),
    },
  };
};
