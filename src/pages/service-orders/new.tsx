import React, { use, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { AdvancedImage } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import { CameraIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { SubmitHandler, useForm } from "react-hook-form";

import axios, { AxiosRequestConfig } from "axios";

import Header from "@/components/header";
import { InputMask } from "@react-input/mask";
import { InputNumberFormat } from "@react-input/number-format";
import { api } from "@/lib/axios";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { ignore } from "@cloudinary/url-gen/qualifiers/rotationMode";

interface ClientProps {
  id: string;
  name: string;
  phone: string;
}

interface serviceProps {
  value: number;
}

interface FormData {
  name: string;
  phone: string;

  value: number;
  amount: number;
  output: Date;
  description: string;
}

export default function New() {
  const router = useRouter();
  const webcamRef = useRef(null);

  const [image, setImage] = useState("");
  const [urlImage, setUrlImage] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showFormClient, setShowFormClient] = useState(true);
  const [allClients, setAllClients] = useState([]);
  const [findedClient, setFindedClient] = useState<ClientProps[]>([]);
  const [nameField, setNameField] = useState("");
  const [orderId, setOrderId] = useState("");
  const [clientId, setClientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [withRedirect, setWithRedirect] = useState(false);
  const [valueEnter, setValueEnter] = useState("0");
  const [valueTotal, setValueTotal] = useState(50 * 100);
  const [modelValueEnterOpen, setModelValueEnterOpen] = useState(false);
  const [showModalEmptyImage, setShowModalEmptyImage] = useState(false);

  const currentDate = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, reset } = useForm();
  const createOrder: SubmitHandler<any> = async (data: FormData) => {
    setIsLoading(true);

    if (findedClient.length === 0) {
      try {
        const client = await api.post("/clients", {
          name: data.name,
          phone: data.phone,
        });

        await api
          .post("/orders", { clientId: client.data.id, output: data.output })
          .then((data) => {
            setOrderId(data.data.id);
            setIsLoading(false);
          });

        setShowFormClient(false);
      } catch (err) {
        console.log(err);
      }
    } else {
      await api
        .post("/orders", { clientId: findedClient[0].id, output: data.output })
        .then((data) => {
          setOrderId(data.data.id);
          setIsLoading(false);
        });
      setShowFormClient(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsLoading(true);

    try {
      await api.delete(`/orders?orderId=${orderId}`).then(() => {
        setIsLoading(false);
        router.push("/service-orders");
      });
    } catch (error) {
      console.log(error);
    }
  };

  const saveService: SubmitHandler<any> = async (data: FormData) => {
    setIsLoading(true);

    if (urlImage === "") {
      setShowModalEmptyImage(true);
      setIsLoading(false);
      return false;
    }

    await api
      .post("/services", {
        value: data.value,
        amount: data.amount,
        description: data.description,
        orderId: orderId,
        image: urlImage,
      })
      .then(() => setIsLoading(false));

    updateValues();

    if (withRedirect) {
      setModelValueEnterOpen(true);
    }
    handleResetFieldsForm();
  };

  const confirmEnterValue = async () => {
    setIsLoading(true);

    const formatedEnterValue = Number(valueEnter.replace(/[^0-9]/g, ""));
    const formatedTotalValue = valueTotal * 100;

    await api
      .put("/orders", {
        orderId: orderId,
        enterValue: formatedEnterValue,
        total: formatedTotalValue,
      })
      .then(() => {
        setIsLoading(true);
        router.push(`/service-orders/${orderId}`);
      });
  };

  async function updateValues() {
    await api.get(`/services?orderId=${orderId}`).then((data) => {
      const services = JSON.parse(data.data);
      let total = 0;

      services.map((service: serviceProps) => {
        total += service.value;
      });

      setValueTotal(total / 100);
    });
  }

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment",
  };

  const myCld = new Cloudinary({
    cloud: {
      cloudName: "daruxsllg",
    },
  });

  let img = myCld.image(image);

  const captureImage = async () => {
    setIsLoading(true);
    //@ts-ignore
    const imageSrc = webcamRef.current.getScreenshot();

    // Enviar a imagem para o Cloudinary
    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/daruxsllg/upload",
        {
          file: imageSrc,
          upload_preset: "ml_default",
        }
      );

      setImage(response.data.public_id);
      setUrlImage(response.data.url);
      setIsLoading(false);
    } catch (error) {}

    setIsOpenModal(false);
  };

  const handleFindClient = (data: string) => {
    // @ts-ignore
    const clients = allClients.data;

    const findedClients = clients.filter(
      (client: ClientProps) => client.phone === data
    );

    if (findedClients.length === 1) {
      setFindedClient(
        clients.filter((client: ClientProps) => client.phone === data)
      );
    } else {
      setFindedClient([]);
      setNameField("");
    }
  };

  const handleConfirmClient = async () => {
    setIsLoading(true);

    setNameField(findedClient[0].name);
    setClientId(findedClient[0].id);

    setIsLoading(false);
  };

  function handleResetFieldsForm() {
    reset({
      value: "",
      amount: "",
      delivery: "",
      description: "",
    });

    setImage("");
  }

  useEffect(() => {
    // @ts-ignore
    api.get("/clients").then((data) => setAllClients(data));
  }, [findedClient, orderId]);

  return (
    <div>
      <Header Title="Novo serviço" />
      <div className="w-full pt-32 pb-10">
        <form
          className={showFormClient ? "flex flex-col px-8" : "hidden"}
          onSubmit={handleSubmit(createOrder)}
        >
          <div className="flex flex-col mb-12">
            <label htmlFor="valor" className="font-bold" tabIndex={1}>
              Celular
            </label>
            <InputMask
              className="w-full border-t-0 border-l-0 border-r-0 border-b-2 border-gray-200 focus:border-gray-950 px-0 py-3 mb-12"
              mask="(__) _____-____"
              replacement={{ _: /\d/ }}
              tabIndex={1}
              {...register("phone")}
              onChange={(e) => {
                e.target.value.length >= 15 && handleFindClient(e.target.value);
              }}
              required
            />

            <div
              className={`justify-between items-center mb-9 bg-amber-950 text-white p-6 rounded-2xl shadow-lg ${
                findedClient.length !== 0 && nameField.length === 0
                  ? "flex"
                  : "hidden"
              }`}
            >
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold" title={findedClient[0]?.name}>
                  {findedClient[0]?.name.length > 20
                    ? `${findedClient[0].name.slice(0, 20)}...`
                    : findedClient[0]?.name}
                </h3>
                <p className="flex items-center gap-2">
                  {findedClient[0]?.phone}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  className="flex items-center justify-center bg-white shadow-2xl rounded-full p-4"
                  onClick={handleConfirmClient}
                  disabled={isLoading ? true : false}
                >
                  {isLoading ? (
                    <ArrowPathIcon className="h-11 text-gray-950 animate-spin" />
                  ) : (
                    <CheckIcon className="h-11 text-gray-950" />
                  )}
                </button>
              </div>
            </div>

            <label htmlFor="valor" className="text-left font-bold">
              Nome do Cliente
            </label>
            <input
              className="w-full border-t-0 border-l-0 border-r-0 border-b-2 border-gray-950 px-0 py-3"
              type="text"
              tabIndex={2}
              {...register("name")}
              defaultValue={nameField}
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="output" className="font-bold" tabIndex={3}>
              Data de Entrega
            </label>
            <input
              className="w-full border-t-0 border-l-0 border-r-0 border-b-2 border-gray-950 px-0 py-3 mb-12"
              type="date"
              {...register("output")}
              min={currentDate}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex gap-2 justify-center font-black shadow-lg rounded-full p-4"
              disabled={
                (findedClient.length !== 0 && nameField.length === 0) ||
                isLoading
                  ? true
                  : false
              }
            >
              {isLoading ? (
                <ArrowPathIcon className="h-8 text-gray-950 animate-spin" />
              ) : (
                <ArrowRightIcon className="h-8" />
              )}
            </button>
          </div>
        </form>

        {/* Formulário do serviço */}
        <form
          action=""
          className={showFormClient ? "hidden" : "flex flex-col"}
          onSubmit={handleSubmit(saveService)}
        >
          <div className="px-8">
            <div className="flex flex-col mb-12 justify-center items-center">
              <button
                type="button"
                onClick={() => setIsOpenModal(true)}
                className="flex relative overflow-hidden h-48 w-48 justify-center items-center bg-slate-100 mb-20 border-dashed border-2 rounded-full cursor-pointer hover:bg-slate-50"
              >
                <AdvancedImage
                  cldImg={img}
                  className="object-cover rounded-3xl absolute"
                />
                <span className="text-slate-300">
                  <CameraIcon className="h-12" />
                </span>
              </button>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label htmlFor="valor" className="font-bold">
                    Valor
                  </label>
                  <InputNumberFormat
                    className="w-full border-t-0 border-l-0 border-r-0 border-b-2 border-gray-950 px-0 py-3"
                    locales="pt-BR"
                    format="currency"
                    currency="BRL"
                    {...register("value")}
                    required
                    tabIndex={1}
                  />
                </div>
                <div>
                  <label htmlFor="valor" className="font-bold">
                    Quantidade
                  </label>
                  <input
                    className="w-full border-t-0 border-l-0 border-r-0 border-b-2 border-gray-950 px-0 py-3"
                    type="number"
                    min={1}
                    {...register("amount")}
                    required
                    tabIndex={2}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col mb-2">
              <label htmlFor="description" className="font-bold">
                O que vai ser feito?
              </label>
              <textarea
                className="border-t-0 border-l-0 border-r-0 border-b-2 border-gray-950 px-0 py-3"
                tabIndex={3}
                placeholder="Ex: Colar e costurar solado..."
                {...register("description")}
                required
              />
            </div>

            <div className="flex flex-col">
              <div className="flex w-full justify-end mb-16 mt-10">
                <button
                  type="submit"
                  className="flex w-full gap-2 justify-center items-center shadow-lg rounded-full p-4 font-bold text-lg"
                  onClick={() => setWithRedirect(false)}
                >
                  Serviço
                  <PlusIcon className="h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex w-full fixed left-0 bottom-0">
            <button
              className="flex w-full gap-2 justify-center items-center shadow-lg bg-red-500 text-white p-4 font-bold text-lg"
              type="button"
              onClick={() => handleCancelOrder()}
              disabled={isLoading ? true : false}
            >
              Cancelar
              {isLoading ? (
                <ArrowPathIcon className="h-8 text-white-950 animate-spin" />
              ) : (
                <XMarkIcon className="h-6" />
              )}
            </button>

            <button
              className="flex w-full gap-2 justify-center items-center shadow-lg bg-green-500 text-white p-4 font-bold text-lg"
              type="submit"
              onClick={() => setWithRedirect(true)}
              disabled={isLoading ? true : false}
            >
              Finalizar
              {isLoading ? (
                <ArrowPathIcon className="h-8 text-white-950 animate-spin" />
              ) : (
                <CheckIcon className="h-6" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de aviso para selecionar imagem */}
      <div
        className={`${
          showModalEmptyImage ? "flex" : "hidden"
        } fixed w-full h-full justify-center items-center top-0 left-0 z-20`}
      >
        <div
          className="flex fixed w-full h-full justify-center items-center top-0 left-0 bg-gray-950 opacity-60"
          onClick={() => setShowModalEmptyImage(false)}
        ></div>
        <div className="p-8 bg-white rounded-lg shadow-2xl z-30">
          <h3>
            Ops, você esqueceu da <span>imagem!</span>
          </h3>
        </div>
      </div>

      {/* Modal da câmera */}
      <div
        className={`fixed w-full h-full top-0 left-0 bg-gray-950 ${
          isOpenModal === true ? "flex" : "hidden"
        } items-center justify-center z-20`}
      >
        <button
          type="button"
          onClick={() => setIsOpenModal(false)}
          className="absolute border-none right-4 top-4"
        >
          <XMarkIcon className="h-10 text-gray-200" />
        </button>

        <Webcam
          audio={false}
          ref={webcamRef}
          videoConstraints={videoConstraints}
        />

        <button
          onClick={captureImage}
          className="absolute bottom-12 border-solid bg-gray-300 border-2 p-6 rounded-full"
          disabled={isLoading ? true : false}
        >
          {isLoading ? (
            <ArrowPathIcon className="h-11 text-gray-950 animate-spin" />
          ) : (
            <CameraIcon className="h-12 text-gray-950" />
          )}
        </button>
      </div>

      {/* Modal valor de entrada */}
      <div
        className={`${
          modelValueEnterOpen ? "flex" : "hidden"
        } fixed items-center justify-center w-full h-full top-0 left-0 z-30`}
      >
        <div className="flex absolute top-0 bottom-0 h-full w-full bg-gray-500 opacity-80"></div>
        <div className="flex flex-col w-full bg-white rounded-lg p-8 mx-4 z-30">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center text-3xl">
              <h3 className="font-bold">Total</h3>
              <p>
                {Number(valueTotal).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div className="flex justify-between">
              <div className="text-gray-400">
                <h3>Entrada</h3>
                <p>{valueEnter}</p>
              </div>
              <div className="text-red-500">
                <h3>Restante</h3>
                <p>{`${(
                  valueTotal -
                  Number(valueEnter.replace(/[^0-9]/g, "")) / 100
                ).toLocaleString("pt-BT", {
                  style: "currency",
                  currency: "BRL",
                })}`}</p>
              </div>
            </div>
          </div>

          <hr className="my-6" />

          <div className="flex flex-col mx-auto w-36">
            <label htmlFor="initial-value">Valor de entrada?</label>
            <InputNumberFormat
              className="w-full border-t-0 border-l-0 border-r-0 border-b-2 border-gray-950 px-0 py-3"
              locales="pt-BR"
              format="currency"
              currency="BRL"
              {...register("valueEnter")}
              required
              onChange={(e) => {
                setValueEnter(e.target.value);
              }}
              value={valueEnter}
            />
          </div>
          <button
            className="flex w-full gap-2 justify-center items-center shadow-lg rounded-full bg-green-500 text-white p-4 mt-12 font-bold text-lg"
            type="button"
            onClick={() => confirmEnterValue()}
            disabled={
              (valueTotal - Number(valueEnter.replace(/[^0-9]/g, "")) / 100 < 0)
                ? true
                : false
                ||
                isLoading ? true : false
            }
          >
            confirmar
            {isLoading ? (
                <ArrowPathIcon className="h-8 text-white-950 animate-spin" />
              ) : (
                <CheckIcon className="h-6" />
              )}
          </button>
        </div>
      </div>
    </div>
  );
}
