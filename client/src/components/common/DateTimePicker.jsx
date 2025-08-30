import { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock } from "lucide-react";

const DateTimePicker = ({
    value, // Accept value (string) from form
    onChange,
    minDate = new Date(),
    placeholder = "Select date and time",
    error = null,
    className = "",
}) => {
    // Convert value string to Date object for react-datepicker
    const getSelectedDate = () => {
        if (value) {
            try {
                return new Date(value);
            } catch (e) {
                console.error("Invalid date value:", value);
                return null;
            }
        }
        return null;
    };

    // Handle change and convert Date back to string format expected by form
    const handleChange = (date) => {
        if (onChange && date) {
            // Convert to the format expected by datetime-local input
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

            // Create a synthetic event object to match the expected format
            const syntheticEvent = {
                target: {
                    name: "startTime",
                    value: formattedDate,
                },
            };
            onChange(syntheticEvent);
        }
    };

    // Custom input component using forwardRef
    const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
        <div
            ref={ref}
            onClick={onClick}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer flex items-center gap-2 ${
                error
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
            } ${className}`}
        >
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className={value ? "text-gray-900" : "text-gray-500"}>
                {value || placeholder}
            </span>
            <Clock className="h-4 w-4 text-gray-400 ml-auto" />
        </div>
    ));

    CustomInput.displayName = "CustomInput";

    return (
        <div className="relative">
            <DatePicker
                selected={getSelectedDate()}
                onChange={handleChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={minDate}
                placeholderText={placeholder}
                customInput={<CustomInput placeholder={placeholder} />}
                popperClassName="custom-datepicker-popper"
                calendarClassName="custom-datepicker-calendar"
                wrapperClassName="w-full"
                shouldCloseOnSelect={false}
                showPopperArrow={false}
            />
        </div>
    );
};

export default DateTimePicker;
