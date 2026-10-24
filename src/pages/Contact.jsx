import { useState } from "react";
import { useSearchParams } from "react-router";
import emailjs from "@emailjs/browser";
import Reveal from "../components/Reveal.jsx";
import { packages, services } from "../data.js";

const emailServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const emailTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const emailPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "";

const serviceOptions = services.map((service) => service.title);

export default function Contact() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const initialService = params.get("service") || "";
  const initialPackage = params.get("package") || "";
  const initialProject = params.get("project") || "";

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    if (!emailServiceId || !emailTemplateId || !emailPublicKey) {
      setStatus("Email is not configured yet. Add the EmailJS settings to your .env file.");
      return;
    }

    const reference = "QEL-" + Date.now().toString(36).toUpperCase();
    const referenceField = form.elements.namedItem("reference");

    if (referenceField) {
      referenceField.value = reference;
    }

    setIsSending(true);
    setStatus("Sending your enquiry…");

    try {
      await emailjs.sendForm(
        emailServiceId,
        emailTemplateId,
        form,
        { publicKey: emailPublicKey },
      );

      form.reset();
      setStatus("Your enquiry was sent. Reference: " + reference);
    } catch {
      setStatus("Sorry, your enquiry could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="page-wrap page-section contact-page" data-scroll-scene="contact">
      <Reveal className="page-heading">
        <p className="eyebrow">CONTACT / START A CONVERSATION</p>
        <h1>
          Tell Us What <span className="gradient-text">You’re Building.</span>
        </h1>
        <p>
          Whether you’re launching a new brand, growing your business, or
          planning your next campaign, let’s explore how QELVAIRO can help.
        </p>
      </Reveal>

      <div className="contact-layout">
        <Reveal className="contact-aside">
          <h2>A good brief starts with a conversation.</h2>
          <p>
            Share what you’re working on. We’ll use the details to understand
            your project and follow up through your preferred contact method.
          </p>

          {contactEmail ? (
            <a className="text-link" href={"mailto:" + contactEmail}>
              {contactEmail} <span className="tiny-icon">↗</span>
            </a>
          ) : (
            <p className="setup-note">
              Add your public contact email in the .env file.
            </p>
          )}
        </Reveal>

        <Reveal className="form-panel">
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="reference" value="" readOnly />

            <div className="form-grid">
              <label>
                Full name
                <input name="name" autoComplete="name" required />
              </label>

              <label>
                Business or brand
                <input
                  name="business"
                  autoComplete="organization"
                  required
                />
              </label>

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Phone number <span className="optional">(optional)</span>
                <input name="phone" type="tel" autoComplete="tel" />
              </label>

              <label>
                Service required
                <select name="service" defaultValue={initialService} required>
                  <option value="">Choose a service</option>
                  {serviceOptions.map((service) => (
                    <option value={service} key={service}>
                      {service}
                    </option>
                  ))}
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              </label>

              <label>
                Package <span className="optional">(optional)</span>
                <select name="package" defaultValue={initialPackage}>
                  <option value="">No package selected</option>
                  {packages.map((plan) => (
                    <option value={plan.name} key={plan.name}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Budget range
                <select name="budget" defaultValue="" required>
                  <option value="" disabled>
                    Select a range
                  </option>
                  <option>Under ₹5,000</option>
                  <option>₹5,000–₹15,000</option>
                  <option>₹15,000–₹50,000</option>
                  <option>₹50,000+</option>
                  <option>To be discussed</option>
                </select>
              </label>

              <label>
                Project timeline
                <select name="timeline" defaultValue="" required>
                  <option value="" disabled>
                    Select a timeline
                  </option>
                  <option>As soon as possible</option>
                  <option>Within 1 month</option>
                  <option>Within 2–3 months</option>
                  <option>Flexible</option>
                </select>
              </label>

              <label className="form-wide">
                Preferred contact method
                <select name="preferred" defaultValue="Email" required>
                  <option>Email</option>
                  <option>Phone</option>
                </select>
              </label>

              <label className="form-wide">
                Project description
                <textarea
                  name="description"
                  rows="5"
                  defaultValue={
                    initialProject
                      ? "I’m interested in the " +
                        initialProject +
                        " project concept. "
                      : ""
                  }
                  required
                />
              </label>
            </div>

            <button className="button" type="submit" disabled={isSending}>
              {isSending ? "Sending…" : "Send Enquiry"}
              <span className="tiny-icon" aria-hidden="true">
                ↗
              </span>
            </button>

            <p className="form-disclosure">
              Your enquiry is emailed using the configured EmailJS template.
              This website does not store the form submission.
            </p>

            {status && (
              <p className="form-status" role="status" aria-live="polite">
                {status}
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
