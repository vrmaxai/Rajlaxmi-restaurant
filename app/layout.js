/* =====================================================================
   ROOT LAYOUT — Rajlakshmi Restaurant (Bansphatak / Godowlia, Varanasi)
   ===================================================================== */

export const metadata = {
  title: "Rajlakshmi Restaurant | AI Review Generator",
  description:
    "Share your experience with Rajlakshmi Restaurant, pure veg family restaurant serving Special Thali, Masala Dosa, stuffed Parathas and North & South Indian meals at Hauz Katora, Bansphatak Road, Varanasi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#7a141c",
        }}
      >
        {children}
      </body>
    </html>
  );
}
