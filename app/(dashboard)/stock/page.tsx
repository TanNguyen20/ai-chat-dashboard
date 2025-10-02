"use client"

export default function StockAppEmbed() {
  return (
    <iframe
      src="https://stock-ap.streamlit.app/?embed=true"
      style={{ width: "100%", height: "700px", border: "0", overflow: "hidden" }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Stock Streamlit App"
    />
  );
}
