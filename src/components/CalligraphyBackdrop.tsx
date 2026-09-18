/**
 * Latar papan informasi beranda: gradasi hijau muda di atas menuju putih di
 * bawah, dengan cahaya hijau lembut, pola geometri bintang delapan, lengkung
 * mihrab, dan kaligrafi Amiri sebagai tanda air. Latarnya tetap terang supaya
 * seluruh teks dan angka jadwal terbaca jelas, termasuk di layar TV besar.
 */
export default function CalligraphyBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-forest-200/80 via-forest-50 to-white" />

      <div className="absolute -top-1/4 left-1/2 h-[70vh] w-[120vh] -translate-x-1/2 rounded-full bg-forest-400/25 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-12%] h-[55vh] w-[55vh] rounded-full bg-mint/30 blur-[130px]" />
      <div className="absolute bottom-[-25%] left-[-12%] h-[50vh] w-[50vh] rounded-full bg-brass/15 blur-[130px]" />

      <div className="absolute inset-0 girih-pattern opacity-[0.07]" />

      <svg
        className="absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 text-forest-700/10"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <path
          d="M50 4c14 13 26 22 26 40v52H24V44c0-18 12-27 26-40Z"
          stroke="currentColor"
          strokeWidth="0.4"
        />
      </svg>

      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
        <span className="arabic select-none whitespace-nowrap text-[clamp(7rem,20vw,26rem)] font-bold leading-none text-forest-900/[0.06]">
          المسجد
        </span>
      </div>
    </div>
  );
}
