import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

export interface Project {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  link: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  type: 'dev' | 'maintenance' | 'training';
}

export interface TrainingClass {
  type: string;
  price: string;
  duration: string;
  location: string;
  features: string[];
}