import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data covering all 28 States and 8 Union Territories in India with major educational hubs
const ALL_INDIAN_STATES = [
  { name: 'Andhra Pradesh', code: 'AP', cities: ['Visakhapatnam', 'Vijayawada', 'Tirupati'] },
  { name: 'Arunachal Pradesh', code: 'AR', cities: ['Itanagar'] },
  { name: 'Assam', code: 'AS', cities: ['Guwahati', 'Silchar'] },
  { name: 'Bihar', code: 'BR', cities: ['Patna', 'Gaya', 'Muzaffarpur'] },
  { name: 'Chhattisgarh', code: 'CG', cities: ['Raipur', 'Bhilai'] },
  { name: 'Goa', code: 'GA', cities: ['Panaji', 'Margao'] },
  { name: 'Gujarat', code: 'GJ', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Gandhinagar'] },
  { name: 'Haryana', code: 'HR', cities: ['Gurugram', 'Faridabad', 'Hisar'] },
  { name: 'Himachal Pradesh', code: 'HP', cities: ['Shimla', 'Dharamshala', 'Mandi'] },
  { name: 'Jharkhand', code: 'JH', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad'] },
  { name: 'Karnataka', code: 'KA', cities: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli'] },
  { name: 'Kerala', code: 'KL', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode'] },
  { name: 'Madhya Pradesh', code: 'MP', cities: ['Bhopal', 'Indore', 'Gwalior'] },
  { name: 'Maharashtra', code: 'MH', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'] },
  { name: 'Manipur', code: 'MN', cities: ['Imphal'] },
  { name: 'Meghalaya', code: 'ML', cities: ['Shillong'] },
  { name: 'Mizoram', code: 'MZ', cities: ['Aizawl'] },
  { name: 'Nagaland', code: 'NL', cities: ['Kohima', 'Dimapur'] },
  { name: 'Odisha', code: 'OR', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela'] },
  { name: 'Punjab', code: 'PB', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'] },
  { name: 'Rajasthan', code: 'RJ', cities: ['Jaipur', 'Kota', 'Jodhpur', 'Udaipur'] },
  { name: 'Sikkim', code: 'SK', cities: ['Gangtok'] },
  { name: 'Tamil Nadu', code: 'TN', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'] },
  { name: 'Telangana', code: 'TG', cities: ['Hyderabad', 'Warangal'] },
  { name: 'Tripura', code: 'TR', cities: ['Agartala'] },
  { name: 'Uttar Pradesh', code: 'UP', cities: ['Lucknow', 'Noida', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj'] },
  { name: 'Uttarakhand', code: 'UK', cities: ['Dehradun', 'Roorkee', 'Nainital'] },
  { name: 'West Bengal', code: 'WB', cities: ['Kolkata', 'Durgapur', 'Siliguri'] },
  { name: 'Delhi NCR', code: 'DL', cities: ['Delhi NCR', 'New Delhi'] },
  { name: 'Chandigarh', code: 'CH', cities: ['Chandigarh'] },
  { name: 'Jammu & Kashmir', code: 'JK', cities: ['Srinagar', 'Jammu'] },
  { name: 'Ladakh', code: 'LA', cities: ['Leh'] },
  { name: 'Puducherry', code: 'PY', cities: ['Puducherry'] },
  { name: 'Andaman & Nicobar', code: 'AN', cities: ['Port Blair'] },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', code: 'DN', cities: ['Daman'] }
];

async function main() {
  console.log('🧹 Clearing existing database records in Neon DB...');
  await prisma.report.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.review.deleteMany();
  await prisma.course.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.institutionClaim.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.comparisonItem.deleteMany();
  await prisma.comparisonSession.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.city.deleteMany();
  await prisma.state.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Seeding States and Cities for ALL 36 States & UTs in India...');

  const cityMap = new Map<string, string>(); // cityName -> cityId

  for (const st of ALL_INDIAN_STATES) {
    const createdState = await prisma.state.create({
      data: {
        name: st.name,
        code: st.code
      }
    });

    for (const cName of st.cities) {
      const isPopular = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Lucknow', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur', 'Ahmedabad'].includes(cName);
      const createdCity = await prisma.city.create({
        data: {
          name: cName,
          stateId: createdState.id,
          popular: isPopular,
          tagLine: `Premier Educational Hub in ${st.name}`,
          image: isPopular
            ? 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80',
          institutionCount: 15,
          schoolCount: 8,
          collegeCount: 7,
          description: `${cName} is a top educational destination in ${st.name} offering accredited CBSE/ICSE schools, engineering colleges, and universities.`
        }
      });

      cityMap.set(cName, createdCity.id);
    }
  }

  console.log('👤 Seeding default users...');
  const userDhruv = await prisma.user.create({
    data: {
      name: 'Dhruv Verma',
      email: 'dhruv.verma@example.com',
      role: 'student',
      cityName: 'Delhi NCR',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    }
  });

  const userPriyanka = await prisma.user.create({
    data: {
      name: 'Priyanka Sharma',
      email: 'priyanka.sharma@gmail.com',
      role: 'parent',
      cityName: 'Mumbai',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
    }
  });

  console.log('🏢 Seeding accredited Institutions across India...');

  const lucknowCityId = cityMap.get('Lucknow') || Array.from(cityMap.values())[0];
  const mumbaiCityId = cityMap.get('Mumbai') || Array.from(cityMap.values())[0];
  const delhiCityId = cityMap.get('Delhi NCR') || Array.from(cityMap.values())[0];
  const bangaloreCityId = cityMap.get('Bangalore') || Array.from(cityMap.values())[0];

  // Inst 1: La Martiniere College Lucknow
  const laMartiniere = await prisma.institution.create({
    data: {
      slug: 'la-martiniere-lucknow',
      name: 'La Martiniere College',
      shortName: 'La Marts Lucknow',
      type: 'School',
      category: 'Schools',
      cityId: lucknowCityId,
      stateName: 'Uttar Pradesh',
      locality: 'Hazratganj',
      address: 'La Martiniere Road, Hazratganj, Lucknow, Uttar Pradesh 226001',
      pinCode: '226001',
      lat: 26.8467,
      lng: 80.9462,
      establishedYear: 1845,
      ownership: 'Private',
      affiliation: 'CISCE (ICSE / ISC)',
      boardOrUniversity: 'CISCE',
      rating: 4.8,
      reviewCount: 342,
      minFee: 120000,
      maxFee: 280000,
      feeDisplayText: '₹1.2 Lakh - ₹2.8 Lakh / year',
      hostelAvailable: true,
      hostelFees: '₹1,50,000 / year',
      campusSize: '200 Acres',
      studentFacultyRatio: '15:1',
      heroImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      description: 'La Martiniere College, Lucknow, established in 1845 under the will of Major General Claude Martin, is one of India’s premier heritage residential and day schools. Famed for its iconic Constantia building, academic excellence, and sports traditions.',
      website: 'https://lamartinierelucknow.org',
      phone: '+91 522 2235421',
      email: 'principal@lamartinierelucknow.org',
      featured: true,
      trending: true,
      verifiedInstitution: true,
      courses: {
        create: [
          { name: 'ICSE Middle & High School (Class 6 - 10)', degree: 'School Certificate', duration: '5 Years', annualFee: '₹1,40,000', feePerYear: 140000, eligibility: 'School Entrance Assessment' },
          { name: 'ISC Science Stream (Class 11 - 12)', degree: 'Higher Secondary', duration: '2 Years', annualFee: '₹1,80,000', feePerYear: 180000, eligibility: 'ICSE Grade 10 Cutoff > 85%' }
        ]
      }
    }
  });

  // Inst 2: IIT Bombay
  const iitBombay = await prisma.institution.create({
    data: {
      slug: 'iit-bombay',
      name: 'Indian Institute of Technology Bombay',
      shortName: 'IIT Bombay',
      type: 'College',
      category: 'Engineering',
      cityId: mumbaiCityId,
      stateName: 'Maharashtra',
      locality: 'Powai',
      address: 'Main Gate Road, Powai, Mumbai, Maharashtra 400076',
      pinCode: '400076',
      lat: 19.1334,
      lng: 72.9133,
      establishedYear: 1958,
      ownership: 'Public',
      affiliation: 'Institute of National Importance (Autonomous)',
      boardOrUniversity: 'Autonomous',
      nirfRank: 3,
      naacGrade: 'A++',
      rating: 4.9,
      reviewCount: 890,
      minFee: 220000,
      maxFee: 350000,
      feeDisplayText: '₹2.2 Lakh - ₹3.5 Lakh / year',
      hostelAvailable: true,
      campusSize: '550 Acres',
      studentFacultyRatio: '10:1',
      averagePlacement: '₹23.5 LPA',
      highestPlacement: '₹1.4 Cr PA',
      heroImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      description: 'IIT Bombay is India’s globally ranked engineering institute located on the shores of Powai Lake. Celebrated for Computer Science, Electrical Engineering, Moody campus life, and Techfest.',
      website: 'https://www.iitb.ac.in',
      phone: '+91 22 2572 2545',
      email: 'admissions@iitb.ac.in',
      featured: true,
      trending: true,
      verifiedInstitution: true,
      courses: {
        create: [
          { name: 'B.Tech Computer Science Engineering', degree: 'B.Tech', duration: '4 Years', annualFee: '₹2,30,000', feePerYear: 230000, eligibility: 'JEE Advanced Rank < 70' },
          { name: 'B.Tech Electrical Engineering', degree: 'B.Tech', duration: '4 Years', annualFee: '₹2,30,000', feePerYear: 230000, eligibility: 'JEE Advanced Rank < 300' }
        ]
      }
    }
  });

  // Inst 3: St. Stephen's College Delhi
  const stStephens = await prisma.institution.create({
    data: {
      slug: 'st-stephens-delhi',
      name: "St. Stephen's College",
      shortName: "St. Stephen's Delhi",
      type: 'College',
      category: 'Science & Arts',
      cityId: delhiCityId,
      stateName: 'Delhi NCR',
      locality: 'North Campus',
      address: 'University Enclave, North Campus, Delhi 110007',
      pinCode: '110007',
      lat: 28.6872,
      lng: 77.2104,
      establishedYear: 1881,
      ownership: 'Government_Aided',
      affiliation: 'University of Delhi (DU)',
      boardOrUniversity: 'University of Delhi',
      nirfRank: 14,
      naacGrade: 'A+',
      rating: 4.7,
      reviewCount: 210,
      minFee: 45000,
      maxFee: 85000,
      feeDisplayText: '₹45,000 - ₹85,000 / year',
      hostelAvailable: true,
      campusSize: '30 Acres',
      studentFacultyRatio: '12:1',
      averagePlacement: '₹10.2 LPA',
      heroImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
      description: "St. Stephen's College is one of the oldest and most prestigious liberal arts and science colleges in India, affiliated with the University of Delhi. Known for academic rigor, distinguished alumni, and red-brick architecture.",
      website: 'https://www.ststephens.edu',
      phone: '+91 11 2766 7200',
      email: 'info@ststephens.edu',
      featured: true,
      trending: true,
      verifiedInstitution: true,
      courses: {
        create: [
          { name: 'B.A. (Hons) Economics', degree: 'Undergraduate', duration: '3 Years', annualFee: '₹55,000', feePerYear: 55000, eligibility: 'CUET UG Percentile > 99.5%' },
          { name: 'B.Sc. (Hons) Mathematics', degree: 'Undergraduate', duration: '3 Years', annualFee: '₹52,000', feePerYear: 52000, eligibility: 'CUET UG Science Cutoff' }
        ]
      }
    }
  });

  console.log('💬 Seeding community reviews...');
  await prisma.review.create({
    data: {
      institutionId: laMartiniere.id,
      userId: userDhruv.id,
      reviewerType: 'Alumni',
      isVerifiedReviewer: true,
      rating: 5.0,
      title: 'Unmatched heritage, sports discipline, and lifetime brotherhood',
      content: 'Studying at La Marts Lucknow shaped my entire personality. Constantia is magical during winter mornings, and the inter-house swimming and debate tradition is unmatched in North India.',
      pros: ['Rich heritage campus', 'World-class sports grounds', 'Strong global alumni network'],
      cons: ['Strict regimented discipline', 'Competitive sports selections'],
      helpfulCount: 28,
      status: 'approved',
      courseOrGrade: 'ISC Class 12 Science',
      yearOfPassingOrCurrent: 2022
    }
  });

  await prisma.review.create({
    data: {
      institutionId: iitBombay.id,
      userId: userPriyanka.id,
      reviewerType: 'Parent',
      isVerifiedReviewer: true,
      rating: 5.0,
      title: 'Best technical education and research ecosystem in South Asia',
      content: 'My son is in his 3rd year CSE at IIT Bombay. The exposure, peer circle, industrial research grants, and placement corporate ties are second to none in India.',
      pros: ['Peer group of top national ranks', 'Massive placement median', 'Powai Lake campus beauty'],
      cons: ['High academic pressure during midterms'],
      helpfulCount: 42,
      status: 'approved',
      courseOrGrade: 'B.Tech CSE',
      yearOfPassingOrCurrent: 2025
    }
  });

  console.log('✅ Database seeding complete for ALL 36 Indian States & UTs!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
