import { useEffect, useState, useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
import React, { JSX } from "react";
import { User, MapPin, Calendar, GraduationCap, Mail, CheckCircle, Clock, XCircle } from "lucide-react";

export interface CarouselItem {
  title: string;
  description: string;
  id: number | string;
  icon?: React.ReactNode | string;
  photo?: string | null;
  name?: string;
  course?: string;
  city?: string;
  admissionYear?: number;
  email?: string;
  status?: 'pending' | 'approved' | 'rejected';
  studentData?: any;
}

export interface CarouselProps {
  items?: CarouselItem[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    title: "Welcome to Our School",
    description: "Submit your application to see students here",
    id: 1,
    icon: "🎓",
  },
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 20;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'approved':
      return {
        icon: <CheckCircle size={16} className="text-green-500" />,
        text: 'Approved',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300'
      };
    case 'rejected':
      return {
        icon: <XCircle size={16} className="text-red-500" />,
        text: 'Rejected',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300'
      };
    default:
      return {
        icon: <Clock size={16} className="text-yellow-500" />,
        text: 'Pending',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300'
      };
  }
};

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 400,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}: CarouselProps): JSX.Element {
  const containerPadding = 20;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
  ]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ): void => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl"
      style={{
        width: `${baseWidth}px`,
        minHeight: '580px'
      }}
    >
      <motion.div
        className="flex"
        drag="x"
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const outputRange = [15, 0, -15];
          const rotateY = useTransform(x, range, outputRange, { clamp: false });
          const statusConfig = getStatusConfig(item.status || 'pending');
          
          return (
            <motion.div
              key={index}
              className="relative shrink-0 cursor-grab active:cursor-grabbing"
              style={{
                width: itemWidth,
                height: '520px',
                rotateY: rotateY,
              }}
              transition={effectiveTransition}
            >
              {/* Student Card */}
              <div className="h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                
                {/* Header with Status */}
                <div className="relative h-24 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                      {statusConfig.icon}
                      {statusConfig.text}
                    </span>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-2 left-3 text-white/20 text-2xl">
                    <GraduationCap size={32} />
                  </div>
                  <div className="absolute bottom-2 right-8 text-white/10 text-4xl font-bold">
                    {item.admissionYear || '2024'}
                  </div>
                </div>

                {/* Profile Photo Section */}
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="relative">
                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt={item.name || item.title}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-4 border-white shadow-lg flex items-center justify-center">
                        <User size={32} className="text-gray-600" />
                      </div>
                    )}
                    
                    {/* Course Icon Badge */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <span className="text-sm">
                        {typeof item.icon === 'string' ? item.icon : '🎓'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Student Information */}
                <div className="px-6 pb-6 space-y-4">
                  
                  {/* Name */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
                      {item.name || item.title}
                    </h3>
                  </div>

                  {/* Course */}
                  <div className="flex items-center justify-center gap-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <GraduationCap size={18} className="text-blue-600 flex-shrink-0" />
                    <span className="text-blue-800 font-medium text-center text-sm leading-tight">
                      {item.course || 'Course Not Specified'}
                    </span>
                  </div>

                  {/* Location and Year */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2 border border-green-200">
                      <MapPin size={16} className="text-green-600 flex-shrink-0" />
                      <span className="text-green-800 text-sm font-medium truncate">
                        {item.city || 'City N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-2 border border-purple-200">
                      <Calendar size={16} className="text-purple-600 flex-shrink-0" />
                      <span className="text-purple-800 text-sm font-medium">
                        {item.admissionYear || '2024'}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  {item.email && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                      <Mail size={16} className="text-gray-600 flex-shrink-0" />
                      <span className="text-gray-700 text-xs truncate">
                        {item.email}
                      </span>
                    </div>
                  )}

                  {/* Description/Additional Info */}
                  {item.description && item.name && (
                    <div className="text-center">
                      <p className="text-gray-600 text-sm italic leading-relaxed">
                        "{item.description}"
                      </p>
                    </div>
                  )}

                  {/* Student ID (if available) */}
                  {item.studentData?.studentId && (
                    <div className="text-center">
                      <span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-mono">
                        ID: {item.studentData.studentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Pagination Dots */}
      <div className="flex w-full justify-center mt-6">
        <div className="flex gap-2 px-4 py-2 bg-black/20 rounded-full backdrop-blur-sm">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-2 rounded-full cursor-pointer transition-all duration-300 ${
                currentIndex % items.length === index
                  ? "bg-orange-400 shadow-lg"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.4 : 1,
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}