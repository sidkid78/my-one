// import { NextResponse } from 'next/server'


// export async function POST(req: Request) {
//   try {
//     const { question } = await req.json()
    
//     // Add more detailed logging
//     console.log('Environment variables:', {
//       BACKEND_URL: process.env.BACKEND_URL,
//     })
    
//     if (!question) {
//       throw new Error('Question is required')
//     }

//     const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
//     console.log('Making request to backend:', {
//       url: `${backendUrl}/api/reason`,
//       question
//     })

//     const response = await fetch(`${backendUrl}/api/reason`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ question }),
//     })

//     if (!response.ok) {
//       const errorText = await response.text()
//       console.error('Backend error response:', errorText)
      
//       try {
//         const errorJson = JSON.parse(errorText)
//         throw new Error(`Backend error: ${JSON.stringify(errorJson)}`)
//       } catch {
//         throw new Error(`Backend error: ${errorText}`)
//       }
//     }

//     const data = await response.json()
//     return NextResponse.json(data)
//   } catch (error) {
//     console.error('Detailed error in reasoning route:', {
//       error,
//       message: error instanceof Error ? error.message : 'Unknown error',
//       stack: error instanceof Error ? error.stack : undefined
//     })
    
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Failed to process reasoning request' },
//       { status: 500 }
//     )
//   }
// }

