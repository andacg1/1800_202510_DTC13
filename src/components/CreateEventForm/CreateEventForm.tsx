import React, { useActionState, useEffect, useState } from "react";

type CreateEventFormProps = {
  className?: string;
  children?: React.ReactNode;
};

const CreateEventForm = ({ className, children }: CreateEventFormProps) => {
  useEffect(() => {}, []);

  return (
    <div className={className}>
      <div className="carousel w-full">
        <div id="step1" className="carousel-item w-full justify-center">
          <form id="create-event-form"></form>
          <div>
            <h1 className="w-full text-2xl mb-2 font-bold" slot="heading">
              Create an Event
            </h1>
            <calendar-date
              className="cally bg-base-100 border border-base-300 shadow-lg rounded-box mb-2"
              id="create-event-calendar"
            >
              <svg
                aria-label="Previous"
                className="fill-current size-4"
                slot="previous"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                ></path>
              </svg>
              <svg
                aria-label="Next"
                className="fill-current size-4"
                slot="next"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
              </svg>
              <calendar-month></calendar-month>
            </calendar-date>
            <label className="input">
              <input
                type="time"
                placeholder="Time"
                name="event-time"
                form="create-event-form"
              />
              <span className="label">Time</span>
            </label>
          </div>
        </div>
        <div id="step2" className="carousel-item w-full justify-center">
          <div>
            <h1 className="w-full text-2xl mb-2 font-bold" slot="heading">
              Details
            </h1>
            <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
              <legend className="fieldset-legend">Details</legend>

              <label className="fieldset-label">Title</label>
              <input
                type="text"
                className="input"
                name="event-title"
                placeholder="My Event"
                form="create-event-form"
              />

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Description</legend>
                <textarea
                  className="textarea h-24"
                  placeholder="Best Event Ever!"
                  name="event-description"
                  form="create-event-form"
                ></textarea>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Tag</legend>

                <input
                  list="existing-tags"
                  placeholder="Start typing..."
                  type="text"
                  className="input"
                  name="event-tag"
                  form="create-event-form"
                />
                <datalist id="existing-tags"></datalist>

                <form className="filter justify-center hidden" id="filter-form">
                  <input className="btn btn-square" type="reset" value="×" />
                </form>
              </fieldset>

              <fieldset className="fieldset flex flex-col items-end">
                <legend className="fieldset-legend block w-full text-end">
                  Is Public
                </legend>

                <input
                  type="checkbox"
                  checked="checked"
                  name="event-is-public"
                  className="toggle toggle-primary"
                  form="create-event-form"
                />
              </fieldset>

              <button
                className="btn btn-success mt-8"
                form="create-event-form"
                name="create-event"
              >
                Create Event
              </button>
            </fieldset>
          </div>
        </div>
        <div id="step3" className="carousel-item w-full justify-center">
          <div>
            <h1 className="w-full text-2xl mb-2 font-bold" slot="heading">
              Attendees
            </h1>
            <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
              <legend className="fieldset-legend">Attendees</legend>

              <label className="fieldset-label">Author</label>
              <input type="text" className="input" placeholder="Name" />
            </fieldset>
          </div>
        </div>
        <div id="step4" className="carousel-item w-full justify-center">
          <div>
            <h1 className="w-full text-2xl mb-2 font-bold" slot="heading">
              Details
            </h1>
            <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
              <legend className="fieldset-legend">Event Details</legend>

              <label className="fieldset-label">Title</label>
              <input
                type="text"
                className="input"
                placeholder="My awesome page"
              />

              <label className="fieldset-label">Slug</label>
              <input
                type="text"
                className="input"
                placeholder="my-awesome-page"
              />

              <label className="fieldset-label">Author</label>
              <input type="text" className="input" placeholder="Name" />

              <label className="fieldset-label">Discord Channel</label>
              <input
                type="text"
                className="input"
                placeholder="Discord Channel"
              />
            </fieldset>
          </div>
        </div>
      </div>
      <div className="steps my-3 mt-3 overflow-visible" id="carousel-steps">
        <a href="#step1" className="step step-primary">
          When
        </a>
        <a href="#step2" className="step step-primary">
          Details
        </a>
      </div>
    </div>
  );
};

export default CreateEventForm;
