import React from "react";
import { useState } from "react";
import {
  Compass, MapPin, CalendarDays, Wallet, Users,
  Sparkles, Mountain, Utensils, Camera, ShoppingBag,
  Landmark, ArrowRight, LoaderCircle, Heart, Clock
} from "lucide-react";

const API = import.meta.env.VITE_API_URL ||
https://wanderly-ai-travel-planner-emji.vercel.app/;

const interestsList = [
  "Nature", "Food", "Photography",
  "Shopping", "History", "Adventure"
];

const sampleTrip = {
  destination: "Jaipur, India",
  summary: "Explore royal forts, local cuisine and colorful markets.",
  estimated_total: 2450,
  days: [
    {
      day: 1,
      title: "Discover the Pink City",
      activities: [
        {
          time: "9:00 AM",
          place: "Amber Fort",
          description: "Explore the historic hilltop fort.",
          cost: 500
        },
        {
          time: "1:00 PM",
          place: "Local Restaurant",
          description: "Enjoy a traditional Rajasthani meal.",
          cost: 350
        },
        {
          time: "4:00 PM",
          place: "Hawa Mahal",
          description: "See the iconic palace facade.",
          cost: 200
        }
      ]
    }
  ],
  tips: ["Carry water.", "Wear comfortable shoes."]
};

export default function App() {
  const [form, setForm] = useState({
    destination: "",
    start_date: "",
    end_date: "",
    budget: 15000,
    travelers: 2,
    travel_style: "Balanced",
    interests: ["Nature", "Food"]
  });

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function update(key, value) {
    setForm(previous => ({ ...previous, [key]: value }));
  }

  function toggleInterest(item) {
    const interests = form.interests.includes(item)
      ? form.interests.filter(i => i !== item)
      : [...form.interests, item];

    update("interests", interests);
  }

  async function generateTrip(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setTrip(null);

    try {
      const response = await fetch(`${API}/api/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget),
          travelers: Number(form.travelers)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to generate itinerary."
        );
      }

      setTrip(data);
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Backend is not running. Start the backend and try again."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  }

  function saveTrip() {
    if (!trip) return;

    try {
      const saved = JSON.parse(
        localStorage.getItem("travel-plans") || "[]"
      );

      saved.push(trip);
      localStorage.setItem("travel-plans", JSON.stringify(saved));
      setMessage("Trip saved successfully on this device!");
    } catch {
      setMessage("Unable to save the trip in this browser.");
    }
  }

  const money = amount =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount || 0);

  return (
    <div className="app">
      <header className="navbar">
        <a href="#" className="logo">
          <Compass size={27} /> wanderly<span>.</span>
        </a>
        <a className="nav-button" href="#planner">
          Plan a trip <ArrowRight size={16} />
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">
              <Sparkles size={16} /> YOUR AI TRAVEL COMPANION
            </p>
            <h1>
              Your next story starts <span>somewhere.</span>
            </h1>
            <p className="description">
              Tell us what you love. Get a personalized travel
              itinerary based on your destination, budget,
              dates and interests.
            </p>
            <a className="primary-button" href="#planner">
              Build my itinerary <ArrowRight size={18} />
            </a>
            <div className="features">
              <span><MapPin size={17} /> Any destination</span>
              <span><Wallet size={17} /> Your budget</span>
              <span><Heart size={17} /> Your interests</span>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=85"
              alt="Beautiful lake and mountain travel destination"
            />
            <div className="image-caption">
              <Compass size={20} />
              <div>
                <strong>Your journey, your way</strong>
                <p>Every trip tells a story.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="planner" className="planner">
          <div className="section-title">
            <p className="eyebrow">LET'S PLAN SOMETHING AMAZING</p>
            <h2>Design your getaway</h2>
            <p>Fill in your travel preferences to get started.</p>
          </div>

          <form className="travel-form" onSubmit={generateTrip}>
            <label>
              <span><MapPin size={17} /> Destination</span>
              <input
                required
                placeholder="e.g. Bali, Paris, Manali"
                value={form.destination}
                onChange={e => update("destination", e.target.value)}
              />
            </label>

            <div className="two-columns">
              <label>
                <span><CalendarDays size={17} /> Start date</span>
                <input
                  type="date"
                  required
                  value={form.start_date}
                  onChange={e => update("start_date", e.target.value)}
                />
              </label>

              <label>
                <span><CalendarDays size={17} /> End date</span>
                <input
                  type="date"
                  min={form.start_date || undefined}
                  required
                  value={form.end_date}
                  onChange={e => update("end_date", e.target.value)}
                />
              </label>
            </div>

            <div className="two-columns">
              <label>
                <span><Wallet size={17} /> Total budget (₹)</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.budget}
                  onChange={e => update("budget", e.target.value)}
                />
              </label>

              <label>
                <span><Users size={17} /> Travellers</span>
                <select
                  value={form.travelers}
                  onChange={e => update("travelers", e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "traveller" : "travellers"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span><Compass size={17} /> Travel style</span>
              <select
                value={form.travel_style}
                onChange={e => update("travel_style", e.target.value)}
              >
                <option>Relaxed</option>
                <option>Balanced</option>
                <option>Adventure</option>
              </select>
            </label>

            <div className="interest-section">
              <h3>What do you love?</h3>
              <p>Select all the interests that match your travel style.</p>

              <div className="interests">
                {interestsList.map(item => {
                  const Icon =
                    item === "Nature" ? Mountain :
                    item === "Food" ? Utensils :
                    item === "Photography" ? Camera :
                    item === "Shopping" ? ShoppingBag :
                    item === "History" ? Landmark : Compass;

                  const selected = form.interests.includes(item);

                  return (
                    <button
                      type="button"
                      key={item}
                      className={selected ? "interest selected" : "interest"}
                      onClick={() => toggleInterest(item)}
                    >
                      <Icon size={17} />
                      {item}{selected ? " ✓" : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="generate" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="spin" />
                  Generating your trip...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Generate my itinerary
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="sample-button"
              onClick={() => {
                setTrip(sampleTrip);
                setMessage("");
              }}
            >
              Preview sample itinerary
            </button>

            {message && <p className="message">{message}</p>}
          </form>
        </section>

        {trip && (
          <section className="results">
            <div className="section-title">
              <p className="eyebrow">
                <Sparkles size={15} /> YOUR TRAVEL PLAN
              </p>
              <h2>{trip.destination}</h2>
              <p>{trip.summary}</p>
            </div>

            <div className="budget-card">
              <Wallet size={22} />
              <span>Estimated activity costs</span>
              <strong>{money(trip.estimated_total)}</strong>
            </div>

            {trip.days?.map((day, index) => (
              <article className="day-card" key={index}>
                <h3>Day {day.day}: {day.title}</h3>

                {day.activities?.map((activity, i) => (
                  <div className="activity" key={i}>
                    <div className="activity-time">
                      <Clock size={15} /> {activity.time}
                    </div>
                    <div className="activity-info">
                      <h4>{activity.place}</h4>
                      <p>{activity.description}</p>
                    </div>
                    <strong>{money(activity.cost)}</strong>
                  </div>
                ))}
              </article>
            ))}

            {trip.tips?.length > 0 && (
              <div className="tips">
                <h3><Sparkles size={17} /> Travel tips</h3>
                <ul>
                  {trip.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className="generate save-button"
              onClick={saveTrip}
            >
              Save this trip
            </button>

            {message && <p className="message">{message}</p>}
          </section>
        )}

        <section className="how">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>From daydream to day plan.</h2>
          <div className="how-grid">
            <article>
              <span>01</span>
              <h3>Share your preferences</h3>
              <p>Enter your dates, budget and interests.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Let AI plan</h3>
              <p>Get a day-wise itinerary made for you.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Save your adventure</h3>
              <p>Keep your plan handy and refine it.</p>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <a className="logo" href="#">
          <Compass size={22} /> wanderly<span>.</span>
        </a>
        <p>Made for curious minds and open roads.</p>
      </footer>
    </div>
  );
}