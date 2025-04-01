'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export default function Page() {
  const [form, setForm] = useState({
    area: '',
    bedrooms: '',
    bathrooms: '',
    stories: '',
    mainroad: 'yes',
    guestroom: 'no',
    basement: 'no',
    hotwaterheating: 'no',
    airconditioning: 'no',
    parking: '',
    prefarea: 'no',
    furnishingstatus: 'unfurnished',
  })

  const [result, setResult] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          area: parseFloat(form.area),
          bedrooms: parseInt(form.bedrooms),
          bathrooms: parseFloat(form.bathrooms),
          stories: parseFloat(form.stories),
          parking: parseInt(form.parking),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'API Error')
      setResult(data.predicted_price)
    } catch (err: any) {
      alert(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">🏠 House Price Predictor</h1>

      {['area', 'bedrooms', 'bathrooms', 'stories', 'parking'].map((field) => (
        <div key={field} className="space-y-1">
          <Label htmlFor={field}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </Label>
          <Input
            id={field}
            type="number"
            value={form[field as keyof typeof form]}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        </div>
      ))}

      {[
        'mainroad',
        'guestroom',
        'basement',
        'hotwaterheating',
        'airconditioning',
        'prefarea',
      ].map((field) => (
        <div key={field} className="space-y-1">
          <Label htmlFor={field}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </Label>
          <Select
            value={form[field as keyof typeof form]}
            onValueChange={(val) => handleChange(field, val)}
          >
            <SelectTrigger id={field}>
              {form[field as keyof typeof form] || <span>Select</span>}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}

      <div className="space-y-1">
        <Label htmlFor="furnishingstatus">Furnishing Status</Label>
        <Select
          value={form.furnishingstatus}
          onValueChange={(val) => handleChange('furnishingstatus', val)}
        >
          <SelectTrigger id="furnishingstatus">
            {form.furnishingstatus || <span>Select</span>}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="furnished">Furnished</SelectItem>
            <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
            <SelectItem value="unfurnished">Unfurnished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? 'Predicting...' : 'Predict Price'}
      </Button>

      {result !== null && (
        <div className="mt-4 text-lg font-semibold text-center">
          🏷️ Predicted Price: ₹{result.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </div>
      )}
    </div>
  )
}
