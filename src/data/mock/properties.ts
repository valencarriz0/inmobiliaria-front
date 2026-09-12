import type { Property } from "../../types/property.ts";

// Initial demo data only. Areas, room counts, owners and dates are fictional.
// Active/paused examples and two publishers exercise the prototype visibility rules.
export const mockProperties: Property[] = [
  {
    "id": "1",
    "title": "Hermosa casa en el centro",
    "description": "Esta hermosa casa ubicada en el corazón de la ciudad ofrece un espacio amplio y cómodo para toda la familia. Cuenta con tres habitaciones, dos baños completos, una cocina moderna y un patio grande ideal para reuniones y actividades al aire libre.",
    "operationType": "sale",
    "propertyType": "house",
    "price": 120000,
    "currency": "USD",
    "location": {
      "country": "Argentina",
      "province": "Córdoba",
      "city": "Córdoba"
    },
    "totalArea": 150,
    "rooms": 4,
    "bedrooms": 3,
    "bathrooms": 2,
    "services": [],
    "amenities": [
      "large_patio"
    ],
    "images": [
      "https://images.unsplash.com/photo-1601837611591-46aaf8ea6601?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2067",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600",
      "https://plus.unsplash.com/premium_photo-1689609950069-2961f80b1e70?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"
    ],
    "publisherId": 1,
    "publicationStatus": "active",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "2",
    "title": "Departamento moderno",
    "description": "Este departamento moderno y luminoso está situado en una zona privilegiada de la ciudad. Con dos habitaciones, un baño completo y un balcón con vistas panorámicas, es perfecto para jóvenes profesionales o parejas que buscan comodidad y estilo de vida urbano.",
    "operationType": "rent",
    "propertyType": "apartment",
    "price": 1000000,
    "currency": "ARS",
    "location": {
      "country": "Argentina",
      "province": "Santa Fe",
      "city": "Rosario"
    },
    "totalArea": 75,
    "rooms": 3,
    "bedrooms": 2,
    "bathrooms": 1,
    "services": [],
    "amenities": [
      "balcony"
    ],
    "images": [
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1722764387833-2a78ac525282?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=600"
    ],
    "publisherId": 1,
    "publicationStatus": "paused",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "3",
    "title": "Departamento en zona residencial",
    "description": "Este departamento se encuentra en una tranquila zona residencial, ideal para familias. Cuenta con todos los servicios disponibles, incluyendo agua, electricidad y acceso a internet, y está cerca de escuelas, comercios y áreas verdes.",
    "operationType": "sale",
    "propertyType": "apartment",
    "price": 100000,
    "currency": "USD",
    "location": {
      "country": "Argentina",
      "province": "Mendoza",
      "city": "Mendoza"
    },
    "totalArea": 120,
    "rooms": 4,
    "bedrooms": 3,
    "bathrooms": 2,
    "services": [],
    "amenities": [],
    "images": [
      "https://media.istockphoto.com/id/2165726057/es/foto/vista-de-%C3%A1ngulo-bajo-de-modernos-edificios-de-apartamentos-de-gran-altura-en-londres-reino.webp?a=1&b=1&s=612x612&w=0&k=20&c=7j7BzV4Opf_cTroIk1DCmofOs9e8-nMBMHmpOQeV03w=",
      "https://images.unsplash.com/photo-1613575831056-0acd5da8f085?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
      "https://plus.unsplash.com/premium_photo-1683769251695-963095b23d67?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"
    ],
    "publisherId": 1,
    "publicationStatus": "active",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "4",
    "title": "Departamento en Palermo",
    "description": "Este departamento moderno y acogedor está ubicado en el vibrante barrio de Palermo. Con dos habitaciones, un baño completo y una cocina equipada, es perfecto para quienes buscan disfrutar de la vida urbana con todas las comodidades cerca.",
    "operationType": "rent",
    "propertyType": "apartment",
    "price": 850,
    "currency": "USD",
    "location": {
      "country": "Argentina",
      "province": "Ciudad Autónoma de Buenos Aires",
      "city": "Buenos Aires"
    },
    "totalArea": 80,
    "rooms": 3,
    "bedrooms": 2,
    "bathrooms": 1,
    "services": [],
    "amenities": [],
    "images": [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600",
      "https://plus.unsplash.com/premium_photo-1676321046262-4978a752fb15?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"
    ],
    "publisherId": 2,
    "publicationStatus": "active",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "5",
    "title": "Casa en las afueras",
    "description": "Esta casa en las afueras ofrece un entorno tranquilo y espacioso, ideal para familias que buscan alejarse del bullicio de la ciudad. Con un amplio terreno y todas las comodidades necesarias, es el lugar perfecto para disfrutar de la naturaleza.",
    "operationType": "sale",
    "propertyType": "house",
    "price": 90000,
    "currency": "USD",
    "location": {
      "country": "Argentina",
      "province": "Córdoba",
      "city": "Córdoba"
    },
    "totalArea": 150,
    "rooms": 4,
    "bedrooms": 3,
    "bathrooms": 2,
    "services": [],
    "amenities": [],
    "images": [
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
      "https://plus.unsplash.com/premium_photo-1684508638760-72ad80c0055f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGhvbWV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGhvbWV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"
    ],
    "publisherId": 1,
    "publicationStatus": "paused",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "6",
    "title": "Departamento céntrico",
    "description": "Este departamento céntrico es ideal para estudiantes o profesionales que buscan estar cerca de todo. Con una habitación cómoda, un baño completo y una cocina funcional, ofrece todo lo necesario para una vida práctica en la ciudad.",
    "operationType": "rent",
    "propertyType": "apartment",
    "price": 600000,
    "currency": "ARS",
    "location": {
      "country": "Argentina",
      "province": "Buenos Aires",
      "city": "La Plata"
    },
    "totalArea": 50,
    "rooms": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "services": [],
    "amenities": [],
    "images": [
      "https://images.unsplash.com/photo-1460408037948-b89a5e837b41?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1582068019386-a943ee9287ae?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDExfHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1529408686214-b48b8532f72c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"
    ],
    "publisherId": 1,
    "publicationStatus": "active",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
];
