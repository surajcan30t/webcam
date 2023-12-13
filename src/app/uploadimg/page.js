'use client'
import React, { useEffect, useRef, useState } from "react";
import ImgCard from "@/components/ImgCard";
import Webcam from "react-webcam";

const page = () => {
    const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [imgUri, setImgUri] = useState([]);
  const [dataUrl, setDataUrl] = useState("");
  const canvasCapture = document.getElementById("displayImage");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const camRef = useRef(null);
  const handleChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  const formObject = (l, i) => {
    const obj = [];
    i?.forEach((x) => {
      l?.forEach((y) => {
        const splitVal = x?.fileName?.split("/");
        if (splitVal[splitVal?.length - 1]?.split(".")[0] === y.id) {
          obj.push({
            fileName: x.fileName,
            lat: y.lat,
            long: y.long,
          });
        }
      });
    });
    setImgUri(obj);
  };

  const makeApiCall = async () => {
    setLoading(true);
    try {
      const imageSrc = camRef.current.getScreenshot();
      const urlParams = {
        url: imageSrc,
      };
      const response = await fetch("/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(urlParams),
      }).then((res) => res.json());
      if (response.statusCode === 200) {
        let params = {};
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            params.id = response?.message?.key?.split(".")[0];
            params.lat = pos.coords.latitude;
            params.long = pos.coords.longitude;

            await fetch("/add-location", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(params),
            });
            const imgs = await fetch("/get-all-images").then((res) =>
              res.json()
            );
            if (imgs.statusCode === 200) {
              const imgLocation = await fetch("/get-all-location").then((res) =>
                res.json()
              );
              formObject(imgLocation.message, imgs.message);
            }
          });
        } else {
          params.id = Math.random() * 10000;
          params.lat = "not enabled";
          params.long = "not enabled";
          await fetch("/add-location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
          });
        }
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      const imgs = await fetch("/get-all-images").then((res) => res.json());
      if (imgs.statusCode === 200) {
        const imgLocation = await fetch("/get-all-location").then((res) =>
          res.json()
        );
        formObject(imgLocation.message, imgs.message);
      }
    };
    fetchImages();
  }, []);
  return (
    <div>
        <div style={{ backgroundColor: "#0096FF", marginBottom: "10px" }}>
          <div style={{ color: "white", fontSize: "42px" }}>
            <span style={{ color: "black" }}>Geo</span>Locator
          </div>
        </div>
        <h3>
          Please upload a photo(
          <span style={{ color: "red" }}>supports .jpg, .png, .jpeg</span>)
        </h3>
        <div style={{ marginBottom: "10px" }}>
          <Webcam ref={camRef} />
        </div>
        {/*<div style={{ marginBottom: "10px" }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleChange(e)}
          />
          </div>*/}
        <button
          disabled={loading}
          style={{
            padding: "5px",
            backgroundColor: "#0096FF",
            color: "white",
            borderRadius: "10%",
          }}
          onClick={makeApiCall}
        >
          {loading ? "Uploading Image..." : "Click and Upload Image"}
        </button>
        <h2>List of Images</h2>
        <div style={{ display: "flex", flexDirection: "row" }}>
          {imgUri.length > 0
            ? imgUri?.map((q) => <ImgCard data={q} />)
            : "No images available!"}
        </div>
      </div>
  )
}

export default page