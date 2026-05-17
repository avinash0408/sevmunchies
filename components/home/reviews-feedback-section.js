'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { toast } from 'sonner'

const renderStars = (rating) => Array.from({ length: 5 }).map((_, i) => (
  <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
))

export default function ReviewsFeedbackSection({ reviews = [], onReviewAdded }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0)
    return (total / reviews.length).toFixed(1)
  }, [reviews])

  const submitFeedback = async () => {
    if (!name.trim()) return toast.error('Please enter your name')
    if (!message.trim()) return toast.error('Please share your feedback')
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not submit feedback')
      toast.success('Thank you for your feedback!')
      setName('')
      setMessage('')
      setRating(5)
      onReviewAdded?.(data)
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="cream-bg">
      <div className="container py-14 md:py-20">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/10">Reviews</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold" style={{ color: '#1E2D5A' }}>
            Customer <span className="orange-text">Feedback</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Real words from snack lovers who enjoy our namkeen every day.
          </p>
          {reviews.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border/60">
              <div className="flex items-center gap-0.5">{renderStars(Math.round(Number(averageRating)))}</div>
              <span className="text-sm font-medium">{averageRating} / 5 from {reviews.length} reviews</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            {reviews.slice(0, 6).map((review) => (
              <Card key={review.id} className="border-border/60 bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold" style={{ color: '#1E2D5A' }}>{review.name}</div>
                    <div className="flex items-center gap-0.5">{renderStars(Number(review.rating || 0))}</div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.message}</p>
                </CardContent>
              </Card>
            ))}
            {reviews.length === 0 && (
              <Card className="md:col-span-2 border-dashed border-border">
                <CardContent className="p-8 text-center text-muted-foreground">
                  Be the first to leave feedback.
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="border-border/60 bg-card h-fit">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-display text-2xl font-bold" style={{ color: '#1E2D5A' }}>Share feedback</h3>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              <div>
                <div className="text-sm font-medium mb-2">Rating</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} type="button" onClick={() => setRating(i + 1)} className="p-1">
                      <Star className={`w-5 h-5 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you loved, or what we can improve..."
                rows={4}
              />
              <Button onClick={submitFeedback} disabled={submitting} className="w-full orange-gradient text-white border-0 rounded-full">
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
