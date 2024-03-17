import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { debounce, set } from "lodash";
import Navbar from "../Components/navbar";
import "../css/q.css";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";

export default () => {
  const [members, setMembers] = useState(0); // Number of members {numeric}
  const [tf, setTf] = useState(0.0); // TotalFootprint {numeric}
  const [prev, setPrev] = useState(0); // Previous value {numeric}
  const [answers, setAnswers] = useState({
    members: 0,
    per_person_drink: false,
    isPurified: false,
    isConsumedBottledWater: undefined,
    bottledWaterFreq: false,
    showerTime: false,
    showerCount: "1",
    lowShowerTaps: "no",
    tapRunoffTime: false,
    lowRunoffTaps: "no",
    isDishWashed: "no",
    waterUsedDishwasher: 0,
    laundryRoutine: false,
    laundryCount: "1",
    cleanHousehold: false,
    waterUsedPlants: false,
    isDessertPlants: "no",
    vehicleCount: 0,
    vehicleWashRoutine: "never",
    vehicleWashFreq: "weekly",
    isPlasticRecycled: "no",
    isPaperRecycled: "no",
    isClothRecycled: "no",
    dietType: false,
    meatFreq: false,
    dairyFreq: false,
    beverageFreq: false,
    petCount: 0,
    petWashFreq: false,
  }); // Answers {array}

  // Function which return tf given the answers
  /**
   * @param {object} answers
   * @returns {number} - run status
   */
  const computeTf = (answers) => {
    let computedTf = 0;
    if (answers.per_person_drink) {
      computedTf += members * parseFloat(answers.per_person_drink);
    }

    if (answers.isPurified === "yes") {
      computedTf += 3 * members * parseFloat(answers.per_person_drink);
    }

    if (answers.bottledWaterFreq) {
      const multiplier = {
        daily: 1.32,
        weeklyOnce: 0.18,
        twiceAWeek: 0.37,
        severalTimesAWeek: 0.56,
        never: 0,
      };
      computedTf += members * multiplier[answers.bottledWaterFreq];
    }
    if (answers.showerTime) {
      if (answers.lowShowerTaps === "no") {
        computedTf +=
          5 *
          members *
          parseFloat(answers.showerTime) *
          parseFloat(answers.showerCount);
      } else {
        computedTf +=
          1.5 *
          members *
          parseFloat(answers.showerTime) *
          parseFloat(answers.showerCount);
      }
    }

    if (answers.tapRunoffTime) {
      if (answers.lowRunoffTaps === "yes") {
        computedTf += 0.5 * parseFloat(answers.tapRunoffTime);
      } else {
        computedTf += 4 * parseFloat(answers.tapRunoffTime);
      }
    }

    if (answers.isDishWashed === "yesHand") {
      computedTf += 25;
    } else if (answers.isDishWashed === "yesDish") {
      computedTf += 13;
    }

    if (answers.waterUsedDishwasher) {
      computedTf += parseFloat(answers.waterUsedDishwasher);
    }

    if (answers.laundryRoutine === "hand") {
      computedTf += 35 * parseFloat(answers.laundryCount);
    } else if (answers.laundryRoutine === "machine") {
      computedTf += 130 * parseFloat(answers.laundryCount);
    } else if (answers.laundryRoutine === "efficient") {
      computedTf += 55 * parseFloat(answers.laundryCount);
    }

    if (answers.cleanHousehold) {
      const multiplier = {
        daily: 8,
        weekly: (1 / 7) * 8,
        monthly: (1 / 30) * 8,
        never: 0,
      };
      computedTf += members * multiplier[answers.cleanHousehold];
    }

    if (answers.waterUsedPlants) {
      computedTf += parseFloat(answers.waterUsedPlants);
    }
    if (answers.isDessertPlants === "yes") {
      computedTf -= 3.5;
    }

    if (answers.vehicleCount) {
      const multiplier = {
        carWash: 60,
        DIY: 150,
        professional: 60,
        never: 0,
      };
      const multiplier1 = {
        weekly: 1 / 7,
        monthly: 1 / 30,
        monthly2: 1 / 60,
      };
      computedTf +=
        parseFloat(answers.vehicleCount) *
        multiplier1[answers.vehicleWashFreq] *
        multiplier[answers.vehicleWashRoutine];
    }

    return computedTf.toFixed(2);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/q", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: answers }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Handle success, e.g., show a success message
      console.log("Form data submitted successfully");
    } catch (error) {
      // Handle errors, e.g., show an error message
      console.error("Error submitting form data:", error);
    }
  };

  // Function to handle input change (some debouning magic here!)
  const handleInputChange = debounce((value, q) => {
    if (q === "q0") {
      setAnswers((prevAnswers) => {
        const updatedAnswers = { ...prevAnswers, per_person_drink: value };
        setTf(computeTf(updatedAnswers)); // Update tf with the new state of answers
        return updatedAnswers; // Return the updated state of answers
      });
    }
    // Water purification methods used or not
    if (q === "q1") {
      setAnswers((prevAnswers) => {
        const updatedAnswers = { ...prevAnswers, isPurified: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q2") {
      setAnswers((prevState) => {
        const updatedAnswers = {
          ...prevState,
          isConsumedBottledWater: value,
        };
        return updatedAnswers;
      });
    }

    if (q === "q3") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, bottledWaterFreq: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q4") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, showerTime: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q5") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, showerCount: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q6") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, lowShowerTaps: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q7") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, tapRunoffTime: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q8") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, lowRunoffTaps: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q9") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, isDishWashed: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q10") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, waterUsedDishwasher: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q11") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, laundryRoutine: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q12") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, laundryCount: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q13") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, cleanHousehold: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q14") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, waterUsedPlants: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q15") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, isDessertPlants: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q16") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, vehicleCount: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q17") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, vehicleWashRoutine: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q18") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, vehicleWashFreq: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q19") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, isPlasticRecycled: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q20") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, isPaperRecycled: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q21") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, isClothRecycled: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }

    if (q === "q22") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, dietType: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q23") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, meatFreq: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q24") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, dairyFreq: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q25") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, beverageFreq: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q26") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, petCount: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
    if (q === "q27") {
      setAnswers((prevState) => {
        const updatedAnswers = { ...prevState, petWashFreq: value };
        setTf(computeTf(updatedAnswers));
        return updatedAnswers;
      });
    }
  }, 500);

  // Element to be returned  (the quiz component!)
  return (
    <>
      <Navbar></Navbar>
      <div className="white-color q-water-footprint">
        Water Footprint of Household:{" "}
        <span className="q-wf-number"> {tf} litres</span>
      </div>
      <div className="white-color q-water-footprint1">
        Water Footprint per person:{" "}
        <span className="q-wf-number"> {tf / members} litres</span>
      </div>
      <form onSubmit={handleSubmit}>
        <Swiper navigation={true} modules={[Navigation]} className="mySwiper">
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How Many People in your household?
              </div>
              <input
                className="slide-input"
                type="number"
                onChange={(e) => {
                  setAnswers((prevState) => ({
                    ...prevState,
                    members: e.target.value,
                  }));
                  setMembers(e.target.value);
                }}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How many liters of water does each member of your household
                typically drink in a day?
              </div>
              <input
                className="slide-input"
                type="number"
                onChange={(e) => {
                  const water = parseInt(e.target.value);
                  handleInputChange(water, "q0");
                }}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                Is your household using any water purification methods, such as
                filters or purifiers?
              </div>
              <div class="rating">
                <form class="rating-form-2">
                  <label for="super-happy1">
                    <input
                      type="radio"
                      name="rating"
                      class="super-happy"
                      id="super-happy1"
                      value="yes"
                      onClick={(e) => {
                        handleInputChange(e.target.value, "q1");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
                    </svg>
                  </label>

                  <label for="super-sad1">
                    <input
                      type="radio"
                      name="rating"
                      class="super-sad"
                      id="super-sad1"
                      value="no"
                      onClick={(e) => {
                        handleInputChange(e.target.value, "q1");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" />
                    </svg>
                  </label>
                </form>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">Do you consume bottled water?</div>
              <div class="rating">
                <form class="rating-form-3">
                  <label for="super-happy2">
                    <input
                      type="radio"
                      name="rating"
                      class="super-happy"
                      id="super-happy2"
                      value="yes"
                      onClick={(e) => {
                        handleInputChange(e.target.value, "q2");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
                    </svg>
                  </label>

                  <label for="super-sad2">
                    <input
                      type="radio"
                      name="rating"
                      class="super-sad"
                      id="super-sad2"
                      value="no"
                      onClick={(e) => {
                        handleInputChange(e.target.value, "q2");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" />
                    </svg>
                  </label>
                </form>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How often do you consume bottled water?
              </div>
              <p className="center">
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("daily", "q3");
                  }}
                >
                  Daily
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("weeklyOnce", "q3");
                  }}
                >
                  Weekly Once
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("twiceAWeek", "q3");
                  }}
                >
                  Twice a week
                </div>
                <div
                  className="slide-btn"
                  nClick={() => {
                    handleInputChange("severalTimesAWeek", "q3");
                  }}
                >
                  Several times a week
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("never", "q3");
                  }}
                >
                  Never
                </div>
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                On average, how long is a shower in per person? (in minutes)
              </div>
              <input
                className="slide-input"
                type="number"
                min="1"
                max="45"
                onChange={(e) => {
                  const water = e.target.value;
                  handleInputChange(water, "q4");
                }}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How many baths do you take per day?
              </div>
              <input
                className="slide-input"
                type="number"
                min="1"
                max="45"
                onChange={(e) => {
                  const water = e.target.value;
                  handleInputChange(water, "q5");
                }}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                Do you use low flow shower-heads for bathing?
              </div>
              <div class="rating">
                <form class="rating-form-4">
                  <label for="super-happy3">
                    <input
                      type="radio"
                      name="rating"
                      class="super-happy"
                      id="super-happy3"
                      value="yes"
                      onClick={() => {
                        handleInputChange("yes", "q6");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
                    </svg>
                  </label>

                  <label for="super-sad3">
                    <input
                      type="radio"
                      name="rating"
                      class="super-sad"
                      id="super-sad3"
                      value="no"
                      onClick={(e) => {
                        handleInputChange("no", "q6");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" />
                    </svg>
                  </label>
                </form>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How long, on average, are the taps in your household left
                running each day? (in minutes)
              </div>
              <input
                className="slide-input"
                type="number"
                min="1"
                max="45"
                onChange={(e) => {
                  const water = e.target.value;
                  handleInputChange(water, "q7");
                }}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                Do you use low flow taps for bathing?
              </div>
              <div class="rating">
                <form class="rating-form-5">
                  <label for="super-happy4">
                    <input
                      type="radio"
                      name="rating"
                      class="super-happy"
                      id="super-happy4"
                      value="yes"
                      onClick={() => {
                        handleInputChange("yes", "q8");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
                    </svg>
                  </label>

                  <label for="super-sad4">
                    <input
                      type="radio"
                      name="rating"
                      class="super-sad"
                      id="super-sad4"
                      value="no"
                      onClick={(e) => {
                        handleInputChange("no", "q8");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" />
                    </svg>
                  </label>
                </form>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How often are dishes wahsed in your household?
              </div>
              <p className="center">
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("no", "q9");
                  }}
                >
                  No, dishes aren't washed in our household
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("yesHand", "q9");
                  }}
                >
                  Yes, Handwashing
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("yesDish", "q9");
                  }}
                >
                  Yes, with Dishwasher
                </div>
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How much water is used to wash dishes? (in litres)
              </div>
              <input
                className="slide-input"
                type="number"
                min="1"
                max="45"
                onChange={(e) => handleInputChange(e.target.value, "q10")}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">What is your laundry routine?</div>
              <p className="center">
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("hand", "q11");
                  }}
                >
                  Wash by hand
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("machine", "q11");
                  }}
                >
                  Old school washing machines
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("efficient", "q11");
                  }}
                >
                  Water/Energy efficient washing machines
                </div>
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                What is your laundry load in number of clothing items? (loads
                per day)(1 load=16 clothing items)
              </div>
              <input
                className="slide-input"
                type="number"
                min="1"
                max="45"
                onChange={(e) => {
                  const water = e.target.value;
                  handleInputChange(water, "q12");
                }}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How often do you clean your household?
              </div>
              <p className="center">
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("daily", "q13");
                  }}
                >
                  Daily
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("weekly", "q13");
                  }}
                >
                  Weekly
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("monthly", "q13");
                  }}
                >
                  Monthly
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("never", "q13");
                  }}
                >
                  Never
                </div>
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How much water do you use for watering plants? (in litres)
              </div>
              <input
                className="slide-input"
                type="number"
                min="1"
                max="45"
                onChange={(e) => {
                  const water = e.target.value;
                  handleInputChange(water, "q14");
                }}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">Do you have desert plants?</div>
              <div class="rating">
                <form class="rating-form-6">
                  <label for="super-happy5">
                    <input
                      type="radio"
                      name="rating"
                      class="super-happy"
                      id="super-happy5"
                      value="yes"
                      onClick={() => {
                        handleInputChange("yes", "q15");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
                    </svg>
                  </label>

                  <label for="super-sad5">
                    <input
                      type="radio"
                      name="rating"
                      class="super-sad"
                      id="super-sad5"
                      value="no"
                      onClick={(e) => {
                        handleInputChange("no", "q15");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" />
                    </svg>
                  </label>
                </form>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">How many vehicles do you own?</div>
              <input
                className="slide-input"
                type="number"
                min="1"
                max="6"
                onChange={(e) => {
                  const water = e.target.value;
                  handleInputChange(water, "q16");
                }}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                What's your vehicle washing routine?
              </div>
              <p className="center">
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("carWash", "q17");
                  }}
                >
                  Car Wash
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("DIY", "q17");
                  }}
                >
                  DIY Scrub
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("professional", "q17");
                  }}
                >
                  Professional service
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("never", "q17");
                  }}
                >
                  Never
                </div>
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How often do you give your vehicle for washing?
              </div>
              <p className="center">
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("weekly", "q18");
                  }}
                >
                  Weekly
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("monthly", "q18");
                  }}
                >
                  Monthly
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("monthly2", "q18");
                  }}
                >
                  Twice A Month
                </div>
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">Do you recycle plastic?</div>
              <div class="rating">
                <form class="rating-form-7">
                  <label for="super-happy6">
                    <input
                      type="radio"
                      name="rating"
                      class="super-happy"
                      id="super-happy6"
                      value="yes"
                      onClick={() => {
                        handleInputChange("yes", "q19");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
                    </svg>
                  </label>

                  <label for="super-sad6">
                    <input
                      type="radio"
                      name="rating"
                      class="super-sad"
                      id="super-sad6"
                      value="no"
                      onClick={() => {
                        handleInputChange("no", "q19");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" />
                    </svg>
                  </label>
                </form>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">Do you recycle paper?</div>
              <div class="rating">
                <form class="rating-form-8">
                  <label for="super-happy7">
                    <input
                      type="radio"
                      name="rating"
                      class="super-happy"
                      id="super-happy7"
                      value="yes"
                      onClick={() => {
                        handleInputChange("yes", "q20");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
                    </svg>
                  </label>

                  <label for="super-sad7">
                    <input
                      type="radio"
                      name="rating"
                      class="super-sad"
                      id="super-sad7"
                      value="no"
                      onClick={() => {
                        handleInputChange("no", "q20");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" />
                    </svg>
                  </label>
                </form>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">Do you donate or reuse clothes?</div>
              <div class="rating">
                <form class="rating-form-9">
                  <label for="super-happy8">
                    <input
                      type="radio"
                      name="rating"
                      class="super-happy"
                      id="super-happy8"
                      value="yes"
                      onClick={() => {
                        handleInputChange("yes", "q21");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" />
                    </svg>
                  </label>

                  <label for="super-sad8">
                    <input
                      type="radio"
                      name="rating"
                      class="super-sad"
                      id="super-sad8"
                      value="no"
                      onClick={() => {
                        handleInputChange("no", "q21");
                      }}
                    />
                    <svg viewBox="0 0 24 24">
                      <path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" />
                    </svg>
                  </label>
                </form>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                What is the primary diet in your household?
              </div>
              <p className="center">
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("vegan", "q22");
                  }}
                >
                  Vegan
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("vegetarian", "q22");
                  }}
                >
                  Vegetarian
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("semiVegetarian", "q22");
                  }}
                >
                  Semi-Vegetarian
                </div>
                <div
                  className="slide-btn"
                  onClick={() => {
                    handleInputChange("nonVegetarian", "q22");
                  }}
                >
                  Non-Vegetarian
                </div>
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How frequently do you consume meat?
              </div>

              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("daily", "q23");
                }}
              >
                Daily
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("weeklyOnce", "q23");
                }}
              >
                Several times a week
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("twiceAWeek", "q23");
                }}
              >
                Weekly once
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("ocassionally", "q23");
                }}
              >
                Ocassionally
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("never", "q23");
                }}
              >
                Never
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                What's your frequency of consuming dairy products?
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("daily", "q24");
                }}
              >
                Daily
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("weeklyOnce", "q24");
                }}
              >
                Several times a week
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("twiceAWeek", "q24");
                }}
              >
                Weekly once
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("ocassionally", "q24");
                }}
              >
                Ocassionally
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("never", "q24");
                }}
              >
                Never
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                What's your frequency of consuming beverages?
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("daily", "q25");
                }}
              >
                Daily
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("several", "q25");
                }}
              >
                Several times a week
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("weeklyOnce", "q25");
                }}
              >
                Weekly once
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("ocassionally", "q25");
                }}
              >
                Ocassionally
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("never", "q25");
                }}
              >
                Never
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">How many pets do you own?</div>
              <input
                className="slide-input"
                type="number"
                min="1"
                max="6"
                onChange={(e) => {
                  const water = e.target.value;
                  handleInputChange(water, "q26");
                }}
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="slide-container">
              <div className="slide-title">
                How often do you wash your pets?
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("daily", "q27");
                }}
              >
                Daily
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("weeklyOnce", "q27");
                }}
              >
                Once a week
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("twiceAWeek", "q27");
                }}
              >
                Weekly twice
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("ocassionally", "q27");
                }}
              >
                Once a month
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("2mounth", "q27");
                }}
              >
                Twice a month
              </div>
              <div
                className="slide-btn"
                onClick={() => {
                  handleInputChange("never", "q27");
                }}
              >
                Never
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
        <a href="/graph">
          <div onSubmit={handleSubmit} className="q-submit">
            Submit
          </div>
        </a>
      </form>
    </>
  );
};
