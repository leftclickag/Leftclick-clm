"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

// ============================================
// 💬 TESTIMONIAL CAROUSEL
// ============================================

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  content: string;
  rating?: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  variant?: "cards" | "minimal" | "featured";
  className?: string;
}

export function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  variant = "cards",
  className = "",
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, testimonials.length]);

  const goTo = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  // Featured variant
  if (variant === "featured") {
    return (
      <div className={`relative ${className}`}>
        <div className="max-w-4xl mx-auto">
          {/* Quote icon */}
          <Quote className="h-16 w-16 text-primary/20 mx-auto mb-6" />

          {/* Content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-center"
            >
              <p className="text-2xl md:text-3xl font-medium text-foreground mb-8 leading-relaxed">
                "{current.content}"
              </p>

              <div className="flex items-center justify-center gap-4">
                {current.avatar ? (
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {current.name[0]}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-semibold text-foreground">{current.name}</p>
                  {(current.role || current.company) && (
                    <p className="text-sm text-muted-foreground">
                      {current.role}
                      {current.role && current.company && " bei "}
                      {current.company}
                    </p>
                  )}
                </div>
              </div>

              {current.rating && (
                <div className="flex justify-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < current.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Minimal variant
  if (variant === "minimal") {
    return (
      <div className={`relative ${className}`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex items-start gap-4"
          >
            {current.avatar ? (
              <img
                src={current.avatar}
                alt={current.name}
                className="h-12 w-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                {current.name[0]}
              </div>
            )}
            <div>
              <p className="text-foreground mb-2">"{current.content}"</p>
              <p className="text-sm font-medium text-foreground">{current.name}</p>
              {current.company && (
                <p className="text-xs text-muted-foreground">{current.company}</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-1.5 mt-4">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Cards variant (default)
  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              {/* Rating */}
              {current.rating && (
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < current.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">"{current.content}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {current.avatar ? (
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {current.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{current.name}</p>
                  {(current.role || current.company) && (
                    <p className="text-sm text-muted-foreground">
                      {current.role}
                      {current.role && current.company && ", "}
                      {current.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// 🌟 TESTIMONIAL GRID
// ============================================

interface TestimonialGridProps {
  testimonials: Testimonial[];
  columns?: 2 | 3;
  className?: string;
}

export function TestimonialGrid({
  testimonials,
  columns = 3,
  className = "",
}: TestimonialGridProps) {
  return (
    <div
      className={`grid gap-6 ${
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
      } ${className}`}
    >
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          {/* Rating */}
          {testimonial.rating && (
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < testimonial.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Content */}
          <p className="text-foreground text-sm mb-4 line-clamp-4">
            "{testimonial.content}"
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            {testimonial.avatar ? (
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                {testimonial.name[0]}
              </div>
            )}
            <div>
              <p className="font-medium text-sm text-foreground">{testimonial.name}</p>
              {testimonial.company && (
                <p className="text-xs text-muted-foreground">{testimonial.company}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

