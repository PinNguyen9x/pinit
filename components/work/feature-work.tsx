import { Work } from '@/models'
import { Box, Container, Typography } from '@mui/material'
import { WorkList } from './work-list'

export function FeatureWork() {
  const workList: Work[] = [
    {
      id: '1',
      title: 'Game tic tac toe',
      thumbnailUrl:
        'https://plus.unsplash.com/premium_photo-1673735396428-d51dc2a7a62d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D',
      tagList: ['Game', 'Web', 'TypeScript'],
      fullDescription: '',
      createdAt: '1722091716231',
      updatedAt: '1722091716231',
      shortDescription:
        'A TypeScript Tic-Tac-Toe game where players take turns marking X and O on a 3x3 grid, with the winner determined by three aligned marks',
    },
    {
      id: '2',
      title: 'Game Color Matching',
      thumbnailUrl:
        'https://plus.unsplash.com/premium_photo-1681843681830-7d4b70a435c1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29sb3J8ZW58MHx8MHx8fDA%3D',
      tagList: ['Game', 'Web', 'TypeScript'],
      fullDescription: '',
      createdAt: '1722091716231',
      updatedAt: '1722091716231',
      shortDescription:
        'A TypeScript-based Color Matching game where players swap tiles to align three or more of the same color, with increasing difficulty and challenges as they progress.',
    },
    {
      id: '3',
      title: 'Dashboard',
      thumbnailUrl:
        'https://media.istockphoto.com/id/1292897536/vi/vec-to/b%E1%BA%A3ng-%C4%91i%E1%BB%81u-khi%E1%BB%83n-%C4%91%E1%BB%93-h%E1%BB%8Da-th%C3%B4ng-tin-giao-di%E1%BB%87n-ng%C6%B0%E1%BB%9Di-d%C3%B9ng-%C4%91%E1%BB%93-h%E1%BB%8Da-d%E1%BB%AF-li%E1%BB%87u-v%C3%A0-bi%E1%BB%83u-%C4%91%E1%BB%93-s%C3%A0ng-l%E1%BB%8Dc.jpg?s=612x612&w=0&k=20&c=w1zIeckEvKHq8IohmsCOOQdAkoM4-aQHP0SX0uu1SeE=',
      tagList: ['Dashboard', 'Web', 'TypeScript', 'ReactJS', 'NextJS', 'MongoDB'],
      fullDescription: '',
      createdAt: '1722091716231',
      updatedAt: '1722091716231',
      shortDescription:
        'A TypeScript-based CRUD application for managing data entries, allowing users to create, read, update, and delete records with an intuitive interface, real-time updates, and error handling.',
    },
  ]
  return (
    <Box component="section" pt={2} pb={4}>
      <Container>
        <Typography variant="h5" mb={4}>
          Feature Works
        </Typography>
        <WorkList workList={workList} />
      </Container>
    </Box>
  )
}
