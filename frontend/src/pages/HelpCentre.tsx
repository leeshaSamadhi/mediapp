import React, { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Icon from '../components/ui/Icon'
import Navbar from '../components/ui/Navbar'
import { FAQ } from '../models/types'
import { sampleFAQs } from '../data/seed'

const HelpCentre: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [filter, setFilter] = useState<'popular' | 'general' | 'services'>('popular')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const storedFaqs = localStorage.getItem('MEDI_FAQS')
    if (storedFaqs) {
      setFaqs(JSON.parse(storedFaqs))
    } else {
      setFaqs(sampleFAQs)
      localStorage.setItem('MEDI_FAQS', JSON.stringify(sampleFAQs))
    }
  }, [])

  const filteredFaqs = faqs.filter(faq => faq.category === filter)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Help Centre</h1>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { key: 'popular', label: 'Popular' },
            { key: 'general', label: 'General' },
            { key: 'services', label: 'Services' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key 
                  ? 'bg-primary-dark text-white' 
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <Icon name="help" size="lg" className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No FAQs found in this category</p>
              </div>
            </Card>
          ) : (
            filteredFaqs.map((faq) => (
              <Card key={faq.id} className="cursor-pointer" onClick={() => toggleExpand(faq.id)}>
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-gray-800 pr-4">{faq.question}</h3>
                  <Icon 
                    name={expandedId === faq.id ? 'chevronLeft' : 'chevronRight'} 
                    size="sm" 
                    className="text-gray-400 flex-shrink-0"
                  />
                </div>
                {expandedId === faq.id && (
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Contact Section */}
        <Card className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Us</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Icon name="chat" size="md" className="text-primary" />
              <div>
                <p className="font-medium text-gray-800">Email Support</p>
                <p className="text-sm text-gray-500">support@mediapp.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Icon name="bell" size="md" className="text-primary" />
              <div>
                <p className="font-medium text-gray-800">Phone Support</p>
                <p className="text-sm text-gray-500">+1 234 567 8900</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <Navbar />
    </div>
  )
}

export default HelpCentre