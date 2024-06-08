import { useEffect } from "react";
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  Marker,
} from "@vis.gl/react-google-maps";
import { FacilityInfo } from "../pages/Mainpage";

export type GeojsonFeature = {
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    TRAEGER: string; // Name: Schulsozialarbeit, Jugendberufshilfen
    BEZEICHNUNG: string; // Name: Schule, Kindertageseinrichtung(with address)
    STRASSE: string;
    HAUSBEZ: string; // Kindertageseinrichtung
    TELEFON: string;
    EMAIL: string; // Schule, Kindertageseinrichtung
    WWW: string; // Website: Schule
    URL: string; // Website: Kindertageseinrichtung
    PLZ: string;
    ORT: string;
    X: string;
    Y: string;
  };
};

export type GeojsonData = {
  type: string;
  name: string;
  features: GeojsonFeature[];
};

export type GeojsonResponse = GeojsonData[];

const colorMarker: { [key: string]: string } = {
  Jugendberufshilfen: "red",
  Kindertageseinrichtungen: "blue",
  Schulen: "green",
  Schulsozialarbeit: "yellow",
};

type MapsProps = {
  facilityInfo: FacilityInfo;
  geojsonData: GeojsonResponse | null;
  setGeojsonData: (geojsonData: GeojsonResponse | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export default function Maps({
  facilityInfo,
  geojsonData,
  setGeojsonData,
  loading,
  setLoading,
}: MapsProps) {
  const mapkey = import.meta.env.VITE_MAPS_API_KEY;

  useEffect(() => {
    async function getFacilities(facilityInfo: FacilityInfo) {
      setLoading(true);
      let facilities = facilityInfo.facilities;
      const response = await fetch("http://localhost:5050/map/facilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ facilities }),
      });
      if (!response.ok) {
        console.error("Failed to fetch facilities data");
        setLoading(false);
        return;
      }
      const geojsonData = await response.json();
      setGeojsonData(geojsonData);
      setLoading(false);
    }
    if (facilityInfo.facilities.length > 0) {
      getFacilities(facilityInfo);
    } else {
      setGeojsonData(null);
    }
  }, [facilityInfo.facilities]);

  return (
    <div className="relative w-full pb-[75%]">
      <div className="absolute top-0 left-0 w-full h-full">
        <APIProvider
          apiKey={mapkey}
          // onLoad={() => console.log("Maps API has loaded.")}
        >
          <Map
            defaultZoom={13}
            defaultCenter={{ lat: 50.82765448060148, lng: 12.921883532093682 }}
            // onCameraChanged={(ev: MapCameraChangedEvent) =>
            //   console.log(
            //     "camera changed:",
            //     ev.detail.center,
            //     "zoom:",
            //     ev.detail.zoom
            //   )
            // }
          >
            {!loading &&
              geojsonData?.flatMap((geojson) =>
                geojson.features.map((feature, index) => (
                  <Marker
                    key={index}
                    position={{
                      lat: feature.geometry.coordinates[1],
                      lng: feature.geometry.coordinates[0],
                    }}
                    icon={{
                      url: `http://maps.google.com/mapfiles/ms/icons/${
                        colorMarker[geojson.name]
                      }-dot.png`,
                    }}
                  />
                ))
              )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
