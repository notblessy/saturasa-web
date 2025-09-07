export const en = {
  // Navigation
  nav: {
    features: 'Features',
    howItWorks: 'How It Works',
    benefits: 'Benefits',
    tryDemo: 'Try Demo',
    getStarted: 'Get Started',
    dashboard: 'Dashboard',
    login: 'Login',
  },

  // Landing Page
  landing: {
    hero: {
      title: 'Streamline Your Warehouse Production',
      subtitle: 'saturasa helps you manage inventories, suppliers, production, and purchasing in one clean dashboard. Perfect for manufacturers and distributors who want to scale efficiently.',
      getStarted: 'Get Started',
      goToDashboard: 'Go to Dashboard',
      tryDemo: 'Try Demo',
    },
    features: {
      title: 'Everything You Need to Manage Your Warehouse',
      subtitle: 'Comprehensive tools designed for modern manufacturing and distribution businesses',
      inventory: {
        title: 'Inventory & Stock Management',
        description: 'Track products, categories, and stock levels with real-time updates and automated alerts.',
      },
      production: {
        title: 'Production & BOM/Recipes',
        description: 'Manage bill of materials, recipes, and production workflows with detailed cost tracking.',
      },
      supplier: {
        title: 'Supplier & Purchase Tracking',
        description: 'Maintain supplier relationships and track all purchase orders from request to delivery.',
      },
      access: {
        title: 'Role-Based Access Control',
        description: 'Secure your data with customizable user roles and permissions for team collaboration.',
      },
    },
    howItWorks: {
      title: 'How It Works',
      subtitle: 'Get started in three simple steps and transform your warehouse operations',
      step1: {
        title: 'Create Your Company Account',
        description: 'Set up your warehouse profile and configure basic settings in minutes.',
      },
      step2: {
        title: 'Set Up Products & Recipes',
        description: 'Add your inventory, create BOMs, and define your production processes.',
      },
      step3: {
        title: 'Track and Manage Everything',
        description: 'Monitor real-time data, generate reports, and optimize your operations.',
      },
    },
    benefits: {
      title: 'Why Choose saturasa?',
      subtitle: 'Built for businesses that want to grow without the operational headaches',
      saveTime: {
        title: 'Save Time on Manual Tasks',
        description: 'Automate repetitive processes and reduce administrative overhead.',
      },
      preventMistakes: {
        title: 'Prevent Inventory Mistakes',
        description: 'Real-time tracking and alerts help avoid stockouts and overstock situations.',
      },
      trackPurchases: {
        title: 'Track Every Purchase Accurately',
        description: 'Complete audit trail from purchase request to final delivery and payment.',
      },
      scalable: {
        title: 'Scalable for Any Business',
        description: 'Perfect for manufacturers, distributors, and growing businesses of all sizes.',
      },
    },
    testimonials: {
      title: 'What Our Customers Say',
      subtitle: 'Join hundreds of businesses that trust saturasa for their warehouse management',
    },
    cta: {
      title: 'Ready to Transform Your Warehouse?',
      subtitle: 'Join thousands of businesses using saturasa to streamline their operations and boost productivity.',
      getStartedNow: 'Get Started Now',
      tryDemo: 'Try Demo',
    },
    footer: {
      description: "The complete warehouse production management solution for modern businesses. Streamline your operations and scale with confidence.",
      product: "Product",
      company: "Company",
      about: "About",
      contact: "Contact",
      documentation: "Documentation",
      support: "Support",
      login: "Login",
      copyright: "© 2024 saturasa. All rights reserved."
    },
  },

  // Login Page
  login: {
    backToHome: 'Back to Home',
    title: 'Welcome to saturasa',
    subtitle: 'Sign in to your saturasa dashboard',
    username: 'Username',
    usernamePlaceholder: 'Enter your username',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
  },

  // Super Admin Page
  superAdmin: {
    title: 'Super Admin Dashboard',
    welcomeBack: 'Welcome back',
    logout: 'Logout',
    companyManagement: {
      title: 'Company Management',
      description: 'Manage companies and create new ones',
      createNew: 'Create New Company',
    },
    allCompanies: {
      title: 'All Companies',
      description: 'View and manage all created companies',
      refresh: 'Refresh',
      loading: 'Loading companies...',
      noCompanies: 'No companies found',
      companyName: 'Company Name',
      website: 'Website',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      noWebsite: 'No website',
    },
    errors: {
      fetchCompanies: 'Failed to fetch companies',
      errorFetchingCompanies: 'Error fetching companies',
    },
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Welcome to Epic Sales warehouse management system',
    stats: {
      totalProducts: 'Total Products',
      activeProductions: 'Active Productions',
      suppliers: 'Suppliers',
      monthlyRevenue: 'Monthly Revenue',
    },
    recentActivities: {
      title: 'Recent Activities',
      subtitle: 'Latest updates from your warehouse',
      newProductAdded: 'New product added',
      productionCompleted: 'Production completed',
      supplierUpdated: 'Supplier updated',
      stockReplenished: 'Stock replenished',
      timeAgo: {
        hoursAgo: 'hours ago',
      },
    },
    quickActions: {
      title: 'Quick Actions',
      subtitle: 'Frequently used operations',
      addProduct: 'Add Product',
      newProduction: 'New Production',
      addSupplier: 'Add Supplier',
      stockUpdate: 'Stock Update',
    },
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
  },
  metadata: {
    title: "saturasa - Simplified ERP for FnB Business",
    description: "saturasa is an ERP for FnB business that simplifies operations and enhances efficiency.",
    openGraph: {
      title: "saturasa - Simplified ERP for FnB Business",
      description: "saturasa is an ERP for FnB business that simplifies operations and enhances efficiency.",
    },
  },
};

export type TranslationKeys = typeof en;