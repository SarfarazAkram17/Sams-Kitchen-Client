import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';

const PlaceOrder = () => {
  const location = useLocation();
  const { cartItems, foods } = location.state || {}; // Get cartItems and foods from location state

  // Initialize form state for personal and delivery details
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'John',  // Default value for example
    lastName: 'Doe',
    phoneNumber: '0123456789',
    email: 'john.doe@example.com',
  });

  const [deliveryInfo, setDeliveryInfo] = useState({
    streetAddress: '',
    region: '',
    district: '',
    thana: '',
  });

  const [otherInfo, setOtherInfo] = useState({
    note: '', // Additional note to add
  });

  // Initialize state for subtotal and discount
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [deliveryCharge] = useState(50); // Assume flat delivery charge for example

  useEffect(() => {
    // Calculate subtotal
    const calculatedSubtotal = cartItems.reduce(
      (sum, item) =>
        sum + (foods.find((food) => food._id === item.foodId)?.price || 0) * item.quantity,
      0
    );
    setSubtotal(calculatedSubtotal);

    // Calculate discount
    const calculatedDiscount = cartItems.reduce((sum, item) => {
      const food = foods.find((food) => food._id === item.foodId);
      return (
        sum + ((food.price * food.discount) / 100) * item.quantity
      );
    }, 0);
    setDiscount(calculatedDiscount);

    // Calculate total amount
    setTotalAmount(calculatedSubtotal + deliveryCharge - calculatedDiscount);
  }, [cartItems, foods, deliveryCharge]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeliveryInfoChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOtherInfoChange = (e) => {
    const { name, value } = e.target;
    setOtherInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    // Handle the order submission (API call or state management)
    console.log('Order submitted!', { personalInfo, deliveryInfo, otherInfo, subtotal, discount, deliveryCharge, totalAmount });
  };

  return (
    <div className="flex flex-wrap gap-10">
      {/* Left Section: Personal & Delivery Info */}
      <div className="w-full md:w-1/2 space-y-8">
        {/* Personal Info */}
        <div className="card p-4 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">First Name</label>
              <input
                type="text"
                name="firstName"
                value={personalInfo.firstName}
                onChange={handlePersonalInfoChange}
                className="input input-bordered w-full"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={personalInfo.lastName}
                onChange={handlePersonalInfoChange}
                className="input input-bordered w-full"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={personalInfo.phoneNumber}
                onChange={handlePersonalInfoChange}
                className="input input-bordered w-full"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={personalInfo.email}
                onChange={handlePersonalInfoChange}
                className="input input-bordered w-full"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="card p-4 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Delivery Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={deliveryInfo.streetAddress}
                onChange={handleDeliveryInfoChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Region</label>
              <input
                type="text"
                name="region"
                value={deliveryInfo.region}
                onChange={handleDeliveryInfoChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">District</label>
              <input
                type="text"
                name="district"
                value={deliveryInfo.district}
                onChange={handleDeliveryInfoChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Thana</label>
              <input
                type="text"
                name="thana"
                value={deliveryInfo.thana}
                onChange={handleDeliveryInfoChange}
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Other Info */}
        <div className="card p-4 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">Note</label>
              <textarea
                name="note"
                value={otherInfo.note}
                onChange={handleOtherInfoChange}
                className="textarea textarea-bordered w-full"
                rows="4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Order Summary */}
      <div className="w-full md:w-1/2 space-y-8">
        <div className="card p-4 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Order Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>৳ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-৳ {discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>৳ {deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span>৳ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmitOrder}
            className="btn btn-primary text-white py-2 px-6 mt-6"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;