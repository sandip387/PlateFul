import { Heart, Users, Award, Clock, ChefHat, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Made with Love",
      description: "Every dish is prepared with genuine care and passion by home cooks who love what they do."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We're building a community that celebrates home cooking and brings neighbors together through food."
    },
    {
      icon: Award,
      title: "Quality Promise",
      description: "We maintain the highest standards for food safety, freshness, and taste in every meal."
    },
    {
      icon: Clock,
      title: "Fresh Daily",
      description: "All meals are prepared fresh daily and delivered within hours to ensure maximum flavor and quality."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b142?w=300",
      bio: "Former chef turned entrepreneur, passionate about connecting communities through food."
    },
    {
      name: "Maria Garcia",
      role: "Head of Culinary Operations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300",
      bio: "20+ years in culinary arts, ensuring every home cook meets our quality standards."
    },
    {
      name: "David Chen",
      role: "Technology Director",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
      bio: "Building the platform that makes ordering homemade meals seamless and enjoyable."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "500+", label: "Home Cooks" },
    { number: "1,000+", label: "Dishes Served Daily" },
    { number: "4.9", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Our Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Plateful was born from a simple belief: the best meals come from the heart. 
            We're connecting passionate home cooks with food lovers in their community, 
            creating a marketplace where every bite tells a story of tradition, love, and authentic flavor.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <ChefHat className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're on a mission to celebrate home cooking and support local food entrepreneurs. 
              By providing a platform for home cooks to share their culinary talents, we're 
              preserving family recipes, cultural traditions, and the art of homemade meals 
              while creating economic opportunities in local communities.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="food-card text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Growing Together
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands who have discovered the joy of authentic homemade meals
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground text-lg">
              The passionate people behind Plateful
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="food-card text-center overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Plateful Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Simple steps to enjoy authentic homemade meals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Browse & Order</h3>
              <p className="text-muted-foreground">
                Explore meals from verified home cooks in your area and place your order
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-secondary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Fresh Preparation</h3>
              <p className="text-muted-foreground">
                Your meal is prepared fresh by passionate home cooks using quality ingredients
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Safe Delivery</h3>
              <p className="text-muted-foreground">
                Enjoy your homemade meal delivered safely to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Star className="h-16 w-16 text-primary-foreground mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Join the Plateful Family
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Whether you're a food lover looking for authentic meals or a home cook 
              wanting to share your culinary passion, there's a place for you at Plateful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="shadow-warm">
                Order Your First Meal
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Become a Home Cook
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;