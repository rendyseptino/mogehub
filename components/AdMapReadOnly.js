"use client";

import { useEffect, useRef } from "react";
import { useColorMode, useColorModeValue } from "@chakra-ui/react";
import { FiMapPin } from "react-icons/fi";
import Image from "next/image";

import { useLanguageContext } from "../context/LanguageContext";
import en from "../locales/en.json";
import id from "../locales/id.json";

let mapboxgl;
if (typeof window !== "undefined") {
  mapboxgl = require("mapbox-gl");
  import("mapbox-gl/dist/mapbox-gl.css");
}

if (mapboxgl) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

function AdMapReadOnly({ lat, lng, isLoggedIn = false }) {
  const mapContainerRef = useRef(null);
  const { colorMode } = useColorMode();

  // ===== LANGUAGE CONTEXT =====
  const { language } = useLanguageContext();
  const t = language === "en" ? en : id;

  const overlayColor = useColorModeValue(
    "rgba(255,255,255,0.25)",
    "rgba(0,0,0,0.25)"
  );

  // ===== MAPBOX LIVE =====
  useEffect(() => {
    if (!isLoggedIn) return;
    if (!mapContainerRef.current || !lat || !lng) return;

    // Cek supaya map gak di-init berkali-kali
    if (mapContainerRef.current.dataset.mapInit) return;

    const mapStyle =
      colorMode === "light"
        ? "mapbox://styles/mapbox/streets-v12"
        : "mapbox://styles/mapbox/dark-v11";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [lng, lat],
      zoom: 12,
      interactive: true,
      attributionControl: false,
    });

    new mapboxgl.Marker({ draggable: false })
      .setLngLat([lng, lat])
      .addTo(map);

    mapContainerRef.current.style.cursor = "pointer";
    mapContainerRef.current.addEventListener("click", () => {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        "_blank"
      );
    });

    mapContainerRef.current.dataset.mapInit = true;

    // Cleanup
    return () => map.remove();
  }, [lat, lng, colorMode, isLoggedIn]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "300px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        overflow: "hidden",
      }}
    >
      {!isLoggedIn && (
        <>
          {/* IMAGE PLACEHOLDER (ANTI CORRUPT) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <Image
              src="/map.png"
              alt="Map placeholder"
              fill
              priority
              unoptimized
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* OVERLAY */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: overlayColor,
              borderRadius: "8px",
              zIndex: 500,
            }}
          />

          {/* TEXT LOGIN */}
          <div
            onClick={() => (window.location.href = "/login")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#000000",
              fontWeight: "bold",
              textAlign: "center",
              zIndex: 1000,
              cursor: "pointer",
              borderRadius: "8px",
              fontSize: "16px",
              padding: "10px",
            }}
          >
            <FiMapPin size={32} color="#ff0000" style={{ marginBottom: "8px" }} />
            {t["login_to_view_location"] || "Login dulu untuk melihat lokasi"}
          </div>
        </>
      )}
      {/* MAP CONTAINER */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          display: isLoggedIn ? "block" : "none",
        }}
      />
    </div>
  );
}

export default AdMapReadOnly;