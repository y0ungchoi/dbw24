import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchPlace from "../components/SearchPlace";

export default function Profile() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    homePlace: "",
    favPlace: "",
    homeLocation: { lat: null, lng: null },
    favLocation: { lat: null, lng: null },
  });
  const id = sessionStorage.getItem("userId") || undefined;
  const navigate = useNavigate();

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  useEffect(() => {
    async function fetchData() {
      if (!id) return navigate("/signin");
      const response = await fetch(
        `http://localhost:5050/api/v1/auth/profile/${id}`
      );
      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const record = await response.json();
      if (!record) {
        console.warn(`Record with id ${id} not found`);
        navigate("/signin");
        return;
      }
      setForm(record);
    }
    fetchData();
    return;
  }, [id, navigate]);

  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const person = { ...form };
    try {
      const response = await fetch(
        `http://localhost:5050/api/v1/auth/profile/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(person),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedResponse = await fetch(
        `http://localhost:5050/api/v1/auth/profile/${id}`
      );
      if (!updatedResponse.ok) {
        throw new Error(`HTTP error! status: ${updatedResponse.status}`);
      }
      const updatedRecord = await updatedResponse.json();
      setForm(updatedRecord);
      setIsEditMode(false);
    } catch (error) {
      console.error("A problem occurred adding or updating a record: ", error);
    }
  }

  function toggleEditMode() {
    setIsEditMode((prev) => !prev);
  }

  async function deleteRecord(id) {
    if (window.confirm("Are you sure you want to delete this record?")) {
      await fetch(`http://localhost:5050/api/v1/auth/profile/${id}`, {
        method: "DELETE",
      });
      sessionStorage.clear();
      navigate("/");
    }
  }

  async function handleSetLocation(placeName, placeType, placeLocation) {
    const mapkey = import.meta.env.VITE_MAPS_API_KEY;
    let location = { lat: null, lng: null };
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText?textQuery=${placeName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": mapkey,
          "X-Goog-FieldMask": "places.location",
        },
      }
    );
    if (!response.ok) {
      console.error("Failed to fetch autocomplete data");
      return;
    }
    const data = await response.json();
    data.places.forEach((place) => {
      location = place.location;
      let lat = location.latitude;
      let lng = location.longitude;
      location = { lat, lng };
    });
    updateForm({
      [placeType]: placeName,
      [placeLocation]: location,
    });
    sessionStorage.setItem(placeLocation, JSON.stringify(location));
  }

  return (
    <div className="mx-auto max-w-7xl py-6 px-6 sm:px-6 lg:px-8">
      <form>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-main">
              Personal Information
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  First name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) => updateForm({ firstName: e.target.value })}
                    className={classNames(
                      !isEditMode
                        ? "ring-gray-300 text-gray-400"
                        : "ring-main focus:ring-2 focus:ring-inset focus:ring-main text-gray-900",
                      "block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 "
                    )}
                    readOnly={!isEditMode}
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => updateForm({ lastName: e.target.value })}
                    className={classNames(
                      !isEditMode
                        ? "ring-gray-300 text-gray-400"
                        : "ring-main focus:ring-2 focus:ring-inset focus:ring-main text-gray-900",
                      "block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 "
                    )}
                    readOnly={!isEditMode}
                  />
                </div>
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address*
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    readOnly
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="homePlace"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Home
                </label>
                <div className="mt-2">
                  {isEditMode ? (
                    <SearchPlace
                      onPlaceSelect={(placeName) =>
                        handleSetLocation(
                          placeName,
                          "homePlace",
                          "homeLocation"
                        )
                      }
                      item={form.homePlace}
                      id="homePlace"
                    />
                  ) : (
                    <input
                      type="text"
                      name="homePlace"
                      id="homePlace"
                      value={form.homePlace ? form.homePlace : ""}
                      placeholder="Select your home"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                      readOnly
                    />
                  )}
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="favPlace"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Favorite place
                </label>
                <div className="mt-2">
                  {isEditMode ? (
                    <SearchPlace
                      onPlaceSelect={(placeName) =>
                        handleSetLocation(placeName, "favPlace", "favLocation")
                      }
                      item={form.favPlace}
                      id="favPlace"
                    />
                  ) : (
                    <input
                      type="text"
                      name="favPlace"
                      id="favPlace"
                      value={form.favPlace ? form.favPlace : ""}
                      placeholder="Select your favorite place"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                      readOnly
                    />
                  )}
                </div>
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password*
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    className={classNames(
                      !isEditMode
                        ? "ring-gray-300 text-gray-400"
                        : "ring-main focus:ring-2 focus:ring-inset focus:ring-main text-gray-900",
                      "block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset placeholder:text-gray-400 sm:text-sm sm:leading-6 "
                    )}
                    onChange={(e) => updateForm({ password: e.target.value })}
                    readOnly={!isEditMode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <div className="mt-6 mb-16 flex items-center justify-between gap-x-6">
        <button
          type="button"
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          onClick={() => deleteRecord(id)}
        >
          Delete your account
        </button>
        <div className="flex gap-x-6">
          {isEditMode ? (
            <>
              <button
                type="button"
                className="rounded-md border ring-1 ring-inset ring-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-input focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main"
                onClick={() => setIsEditMode(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Save
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleEditMode}
              className="rounded-md bg-main px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-input hover:text-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
