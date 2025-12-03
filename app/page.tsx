"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  Factory,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Clock,
  Target,
  Zap,
  Star,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTranslation } from "@/lib/hooks/use-translation"
import LanguageSelector from "@/components/language-selector"

export default function LandingPage() {
  const { t } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated")
    setIsAuthenticated(!!auth)
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  const handleTryDemo = () => {
    router.push("/login")
  }

  const features = [
    {
      icon: Package,
      title: t.landing.features.inventory.title,
      description: t.landing.features.inventory.description,
    },
    {
      icon: Factory,
      title: t.landing.features.production.title,
      description: t.landing.features.production.description,
    },
    {
      icon: Users,
      title: t.landing.features.supplier.title,
      description: t.landing.features.supplier.description,
    },
    {
      icon: Shield,
      title: t.landing.features.access.title,
      description: t.landing.features.access.description,
    },
  ]

  const steps = [
    {
      icon: CheckCircle,
      title: t.landing.howItWorks.step1.title,
      description: t.landing.howItWorks.step1.description,
    },
    {
      icon: Package,
      title: t.landing.howItWorks.step2.title,
      description: t.landing.howItWorks.step2.description,
    },
    {
      icon: BarChart3,
      title: t.landing.howItWorks.step3.title,
      description: t.landing.howItWorks.step3.description,
    },
  ]

  const benefits = [
    {
      icon: Clock,
      title: t.landing.benefits.saveTime.title,
      description: t.landing.benefits.saveTime.description,
    },
    {
      icon: Target,
      title: t.landing.benefits.preventMistakes.title,
      description: t.landing.benefits.preventMistakes.description,
    },
    {
      icon: CheckCircle,
      title: t.landing.benefits.trackPurchases.title,
      description: t.landing.benefits.trackPurchases.description,
    },
    {
      icon: Zap,
      title: t.landing.benefits.scalable.title,
      description: t.landing.benefits.scalable.description,
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Operations Manager",
      company: "TechCorp Manufacturing",
      content:
        "saturasa transformed our warehouse operations. We've reduced inventory errors by 90% and improved efficiency dramatically.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Michael Chen",
      role: "Supply Chain Director",
      company: "Global Distributors Inc.",
      content:
        "The real-time tracking and automated alerts have saved us countless hours. Our team can focus on growth instead of manual tasks.",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#F2F1ED] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Image alt="saturasa logo" src="/saturasa-min.png" width={120} height={40} className="h-8" />
              </div>
              <span className="font-bold text-xl text-primary">
                saturasa
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-primary transition-colors">
                {t.nav.features}
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">
                {t.nav.howItWorks}
              </Link>
              <Link href="#benefits" className="text-gray-600 hover:text-primary transition-colors">
                {t.nav.benefits}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Button
                variant="outline"
                onClick={handleTryDemo}
                className="border-primary/20 text-primary hover:bg-primary/5 bg-transparent"
              >
                {t.nav.tryDemo}
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-primary hover:bg-primary/90"
              >
                {isAuthenticated ? t.nav.dashboard : t.nav.getStarted}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {t.landing.hero.title}
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t.landing.hero.subtitle}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
              >
                {isAuthenticated ? t.landing.hero.goToDashboard : t.landing.hero.getStarted}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleTryDemo}
                className="border-primary/20 text-purple-600 hover:bg-primary/5 text-lg px-8 py-3 bg-transparent"
              >
                {t.landing.hero.tryDemo}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.landing.features.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.landing.features.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.landing.howItWorks.title}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.landing.howItWorks.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose saturasa Section */}
      <section id="benefits" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.landing.benefits.title}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.landing.benefits.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.landing.testimonials.title}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.landing.testimonials.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <p className="text-sm text-primary">{testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.landing.cta.title}</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t.landing.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3"
              >
                {isAuthenticated ? t.landing.hero.goToDashboard : t.landing.cta.getStartedNow}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleTryDemo}
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-3 bg-transparent"
              >
                {t.landing.cta.tryDemo}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">sa</span>
                </div>
                <span className="font-bold text-xl">saturasa</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                {t.landing.footer.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t.landing.footer.product}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    {t.nav.features}
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-white transition-colors">
                    {t.nav.howItWorks}
                  </Link>
                </li>
                <li>
                  <Link href="#benefits" className="hover:text-white transition-colors">
                    {t.nav.benefits}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    {t.landing.footer.login}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t.landing.footer.company}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t.landing.footer.about}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t.landing.footer.contact}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t.landing.footer.documentation}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t.landing.footer.support}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>{t.landing.footer.copyright}</p>
            </div>
        </div>
      </footer>
    </div>
  )
}
