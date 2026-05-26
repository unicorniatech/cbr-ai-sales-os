import Image from "next/image";

export function VistaDevCredit() {
  return (
    <a
      href="https://www.vistadev.mx"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 text-xs text-white/42 transition hover:text-[#f3d99a]"
    >
      <Image
        src="/brand/vistadevlogo.png"
        alt=""
        width={22}
        height={22}
        className="size-5 object-contain opacity-75"
      />
      <span>Hecha por VistaDev (www.vistadev.mx)</span>
    </a>
  );
}
