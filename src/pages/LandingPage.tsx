
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-food-cream to-white">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md w-full space-y-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold font-display text-food-dark">What to Eat</h1>
          <p className="text-food-dark/80 mt-4">
            Discover delicious restaurants nearby based on your preferences and location.
          </p>
          
          <div className="flex flex-col space-y-4 pt-6">
            <Link to="/restaurants" className="w-full">
              <Button className="w-full bg-food-orange hover:bg-food-red text-white rounded-full flex items-center justify-center gap-2">
                Find Restaurants <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              This app will request your location to find nearby restaurants
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
