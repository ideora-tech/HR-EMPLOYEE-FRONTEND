import './sky-dance.css'
import { displayFont, bodyFont } from './fonts'
import Navbar from './Navbar'
import Hero from './Hero'
import WaveDivider from './WaveDivider'
import HighlightStrip from './HighlightStrip'
import TentangKami from './TentangKami'
import ProgramTingkat from './ProgramTingkat'
import KenapaKami from './KenapaKami'
import StatementBand from './StatementBand'
import CtaBanner from './CtaBanner'
import Footer from './Footer'

const DIRECTION_CONTRACT = `<!--
THESIS: sebuah sekolah tari berjenjang yang meyakinkan dan mudah dipahami dalam sekali lihat, dibangun dari warna & tipografi berani -- bukan foto dokumentasi yang tidak kami punya, bukan motif abstrak yang bikin bingung.
OWN-WORLD: warna diambil langsung dari logo -- ungu #4a3b7a, pink/magenta #b0529c sebagai aksen utama, navy #16204a untuk band gelap, latar terang #ffffff/#f8f5fc untuk isi; Baloo 2 (bold, rounded) untuk judul, Plus Jakarta Sans untuk tubuh; kartu putih dengan lencana ikon berwarna, tanpa motif langit malam/rasi bintang.
STORY: pengunjung paham Sky Dance itu akademi tari berjenjang nyata (Pemula->Menengah->Mahir), lalu menekan satu CTA WhatsApp.
FIRST VIEWPORT: navbar navy sticky dengan logo, hero gradient ungu-ke-pink dengan headline bold dua baris + dua CTA + baris chip sorotan, logo besar dalam bingkai lingkaran putih dengan bentuk organik dekoratif di sisi kanan.
FORM: struktur informasi (navbar, hero dual-CTA, wave divider, highlight strip, program grid, kenapa-kami grid, statement band, CTA banner, footer 3-kolom) direferensikan langsung dari situs sibling milik user, sulita.ideora-tech.com. Dunia visual di-reskin total atas permintaan eksplisit user kedua kalinya: arah "Peta Rasi Bintang" (seed e8229632, langit malam + rasi bintang) diganti ke arah "standar kategori" -- template dance-studio konvensional yang berani & mudah dikenali -- karena user secara eksplisit bilang tidak suka nuansa rasi bintang. Warna & jenis huruf tetap bersumber dari logo Sky Dance, bukan pilihan bebas.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`

export default function ProfilSkyDance() {
    return (
        <div
            className={`${displayFont.variable} ${bodyFont.variable} sky-profile min-h-screen`}
            style={{ fontFamily: 'var(--sky-font-body)' }}
        >
            <div
                aria-hidden
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }}
            />
            <Navbar />
            <Hero />
            <WaveDivider />
            <HighlightStrip />
            <TentangKami />
            <ProgramTingkat />
            <KenapaKami />
            <StatementBand />
            <CtaBanner />
            <Footer />
        </div>
    )
}
