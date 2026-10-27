import { useState } from 'react';
import api from '../api';

// Form sections: [section title, [[field, label], ...]]
const SECTIONS = [
  ['Your Details', [['name', 'Full Name'], ['phone', 'Phone'], ['email', 'Email']]],
  ['Company', [['companyName', 'Company Name'], ['companyAddress', 'Address'], ['gstNumber', 'GST Number']]],
  ['Bank Details', [
    ['bankName', 'Bank Name'], ['accountHolder', 'Account Holder Name'], ['accountNumber', 'Account Number'],
    ['ifscCode', 'IFSC Code'], ['upiId', 'UPI ID'],
  ]],
];

export default function Profile({ profile, onSaved }) {
  // App only renders this page once the profile has loaded, so we can start the form from it
  const [form, setForm] = useState(profile);
  const [message, setMessage] = useState('');

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
    setMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await api.put('/profile', form);
    onSaved(res.data);
    setMessage('Profile saved');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="page-head">
        <div>
          <h1>Edit Profile</h1>
          <p className="muted">Your details, company information and bank account.</p>
        </div>
        <div className="actions">
          {message && <span className="saved">{message}</span>}
          <button type="submit" className="btn primary">Save Profile</button>
        </div>
      </div>

      {SECTIONS.map(([title, fields]) => (
        <section key={title} className="box">
          <div className="box-head"><h2>{title}</h2></div>
          <div className="form-grid pad">
            {fields.map(([field, label]) => (
              <label key={field}>
                {label}
                <input value={form[field] || ''} onChange={(e) => handleChange(field, e.target.value)} />
              </label>
            ))}
          </div>
        </section>
      ))}
    </form>
  );
}
