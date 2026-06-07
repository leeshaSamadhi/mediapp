import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/home/profile')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
          >
            <Icon name="chevronLeft" size="md" className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Privacy Policy</h1>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Introduction</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Welcome to MediApp. We are committed to protecting your personal information and your right to privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
            our mobile application and services.
          </p>
        </Card>

        {/* Data Collection */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Information We Collect</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 ml-2">
            <li>Personal identification information (Name, email address, phone number)</li>
            <li>Profile information (Date of birth, profile picture)</li>
            <li>Health-related information (Appointment history, medical preferences)</li>
            <li>Payment information (Credit card details, billing address)</li>
            <li>Communication data (Messages with healthcare providers)</li>
          </ul>
        </Card>

        {/* Data Usage */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">How We Use Your Information</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 ml-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your appointments and transactions</li>
            <li>Send you notifications about appointments and updates</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Personalize your experience and deliver content relevant to your interests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
          </ul>
        </Card>

        {/* Data Protection */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Data Protection</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We implement appropriate technical and organizational security measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. These measures include 
            encryption of data in transit and at rest, regular security assessments, and strict access controls 
            for our staff.
          </p>
        </Card>

        {/* User Rights */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Rights</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 ml-2">
            <li>Access and receive a copy of your personal data</li>
            <li>Rectify inaccurate or incomplete personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Restrict or object to the processing of your data</li>
            <li>Data portability - receive your data in a structured, machine-readable format</li>
            <li>Withdraw consent at any time where we rely on consent to process your data</li>
          </ul>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Contact Us</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            If you have questions or comments about this policy, you may contact us at:
          </p>
          <div className="text-gray-600 text-sm space-y-1">
            <p><strong>Email:</strong> privacy@mediapp.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Address:</strong> 123 Health Street, Medical District, NY 10001</p>
          </div>
        </Card>

        {/* Last Updated */}
        <Card>
          <p className="text-gray-500 text-xs text-center">
            Last Updated: April 20, 2026
          </p>
        </Card>
      </div>
      <Navbar />
    </div>
  )
}

export default PrivacyPolicy