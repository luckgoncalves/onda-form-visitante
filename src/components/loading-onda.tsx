import Image from "next/image";

export default function LoadingOnda() {
  return (
    <main className="flex w-full h-[100%]  min-h-screen flex-col  justify-center items-center gap-4 p-4">
        <div className="flex justify-center items-center h-full">
          <Image
            src="/logo-svg.svg"
            alt="Onda Logo"
            width={550}
            height={350}
            className="m-auto"
          />
        </div>
      </main>
  );
}