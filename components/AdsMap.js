"use client";

import { useEffect, useRef, useState } from "react";
import { useColorMode } from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function AdsMap({ form, setForm, clearError }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const { colorMode } = useColorMode();
  const [cityList, setCityList] = useState([]);

  // ================= ENGLISH -> INDONESIA NORMALIZATION =================
  const regionAlias = {
    "south jakarta": "Jakarta Selatan",
    "north jakarta": "Jakarta Utara",
    "west jakarta": "Jakarta Barat",
    "east jakarta": "Jakarta Timur",
    "central jakarta": "Jakarta Pusat",
    "west java": "Jawa Barat",
    "central java": "Jawa Tengah",
    "east java": "Jawa Timur",
    "north sumatra": "Sumatera Utara",
    "west sumatra": "Sumatera Barat",
    "south sumatra": "Sumatera Selatan",
    "west kalimantan": "Kalimantan Barat",
    "central kalimantan": "Kalimantan Tengah",
    "south kalimantan": "Kalimantan Selatan",
    "east kalimantan": "Kalimantan Timur",
    "north kalimantan": "Kalimantan Utara",
    "north sulawesi": "Sulawesi Utara",
    "central sulawesi": "Sulawesi Tengah",
    "south sulawesi": "Sulawesi Selatan",
    "west sulawesi": "Sulawesi Barat",
    "southeast sulawesi": "Sulawesi Tenggara",
    "special capital region of jakarta": "DKI Jakarta",
    "west nusa tenggara": "Nusa Tenggara Barat",
    "east nusa tenggara": "Nusa Tenggara Timur",
    "north maluku": "Maluku Utara",
    "west papua": "Papua Barat"
  };

  const hardcodedCities = [
    "Jakarta Selatan","Jakarta Barat","Jakarta Timur","Jakarta Utara","Jakarta Pusat",
    "Bandung","Bekasi","Bogor","Depok","Tangerang","Tangerang Selatan",
    "Semarang","Surabaya","Malang","Medan","Palembang","Makassar",
    "Denpasar","Pontianak","Balikpapan","Samarinda","Manado","Ambon","Jayapura"
  ];

  // ================= FETCH CITY LIST =================
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch("https://api.mogehub.com/api/cities");
        const data = await res.json();
        const backendCities = [];
        data.forEach(p => {
          backendCities.push(p.province);
          p.cities.forEach(c => backendCities.push(c));
        });
        const merged = [...new Set([...backendCities, ...hardcodedCities])];
        setCityList(merged);
      } catch (err) {
        console.error("Failed fetch cities:", err);
        setCityList(hardcodedCities);
      }
    };
    fetchCities();
  }, []);

  // ================= NORMALIZE TEXT =================
  const normalizeText = (text) => {
    const lower = text.toLowerCase();
    return regionAlias[lower] || text;
  };

  // ================= CITY DETECTOR =================
  const detectCity = (texts) => {
    for (const rawText of texts) {
      const text = normalizeText(rawText);
      const lower = text.toLowerCase();
      const found = cityList.find(city =>
        lower.includes(city.toLowerCase())
      );
      if (found) return found;
    }
    return "";
  };

  // ================= HIDE MAPBOX LOGO & ATTRIBUTION =================
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      .mapboxgl-ctrl-logo, 
      .mapboxgl-ctrl-attrib {
        display: none !important;
      }
    `;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  // ================= UPDATE FORM FUNCTION =================
  const updateFormFromCoords = async (lngLat) => {
    setForm(prev => ({
      ...prev,
      longitude: lngLat.lng,
      latitude: lngLat.lat
    }));
    if (clearError) clearError("location");

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const address = feature.place_name;
        const textList = [
          feature.text,
          feature.place_name,
          ...(feature.context || []).map(c => c.text)
        ].filter(Boolean);

        const detectedCity = detectCity(textList);

        setForm(prev => {
          const newForm = {
            ...prev,
            addressDetail: address,
            city: detectedCity || prev.city
          };
          if (detectedCity && clearError) clearError("city");
          return newForm;
        });
      }

    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  // ================= MAP INIT =================
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapStyle =
      colorMode === "light"
        ? "mapbox://styles/mapbox/streets-v12"
        : "mapbox://styles/mapbox/dark-v11";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [form.longitude || 107.6191, form.latitude || -6.9175],
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current = map;

    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([form.longitude || 107.6191, form.latitude || -6.9175])
      .addTo(map);

    markerRef.current = marker;

    // ================= DRAG MARKER =================
    marker.on("dragend", async () => {
      const lngLat = marker.getLngLat();
      await updateFormFromCoords(lngLat);
    });

    // ================= GEOCODER =================
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Search location",
      zoom: 12
    });

    geocoder.on("result", e => {
      const coords = e.result.center;

      // ===== ANIMASI MARKER TERBANG =====
      const start = marker.getLngLat();
      const end = { lng: coords[0], lat: coords[1] };
      const frames = 30;
      let count = 0;

      const animate = () => {
        count++;
        const lng = start.lng + (end.lng - start.lng) * (count / frames);
        const lat = start.lat + (end.lat - start.lat) * (count / frames);
        marker.setLngLat([lng, lat]);
        if (count < frames) requestAnimationFrame(animate);
        else {
        const addressDetail = e.result.place_name || "";
        const textList = [
          e.result.text,
          e.result.place_name,
          ...(e.result.context || []).map(c => c.text)
        ].filter(Boolean);

        const detectedCity = detectCity(textList);

        setForm(prev => ({
          ...prev,
          longitude: end.lng,
          latitude: end.lat,
          addressDetail,
          city: detectedCity || prev.city
        }));

        if (clearError) {
          clearError("location");
          if (detectedCity) clearError("city");
        }
      }
            };
            animate();
          });

    map.addControl(geocoder, "top-left");

    // ================= STYLE GEOCODER INPUT =================
    const styleGeocoderInput = () => {
      const input = document.querySelector(".mapboxgl-ctrl-geocoder input");
      if (!input) return;

      input.style.color = colorMode === "light" ? "#000" : "#fff";
      input.style.background = colorMode === "light" ? "#fff" : "#1A202C";
      input.style.border = "1px solid #ccc";
      input.style.borderRadius = "4px";
      input.style.padding = "6px 10px";

      const basePaddingLeft = 32;
      const extraMobilePadding = window.innerWidth <= 768 ? 12 : 0;
      input.style.paddingLeft = `${basePaddingLeft + extraMobilePadding}px`;

      input.style.setProperty("caret-color", colorMode === "light" ? "#000" : "#fff");

      const placeholderColor = colorMode === "light" ? "#888" : "#ddd";

      let styleEl = document.getElementById("geocoder-placeholder-style");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "geocoder-placeholder-style";
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `.mapboxgl-ctrl-geocoder input::placeholder { color: ${placeholderColor}; }`;
    };

    styleGeocoderInput();
    const observer = new MutationObserver(styleGeocoderInput);
    observer.observe(document.body, { childList: true, subtree: true });

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      map.remove();
    };

  }, [setForm, colorMode, cityList]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "300px",
        borderRadius: "8px",
        border: "1px solid #ccc"
      }}
    />
  );
}