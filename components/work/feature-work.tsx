import { Work } from '@/models'
import { Box, Container, Typography } from '@mui/material'
import { WorkList } from './work-list'

export function FeatureWork() {
  const workList: Work[] = [
    {
      id: '1',
      title: 'Designing Dashboards',
      thumbnailUrl:
        'https://res.cloudinary.com/dkbq0asaw/image/upload/v1722149824/thumnail3_rzemwy.jpg',
      tagList: ['Dashboard'],
      fullDescription: '',
      createdAt: '1722091716231',
      updatedAt: '1722091716231',
      shortDescription:
        'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
    },
    {
      id: '2',
      title: 'Vibrant Portraits of 2020',
      thumbnailUrl:
        'https://res.cloudinary.com/dkbq0asaw/image/upload/v1722149824/thumnail2_ieuan1.jpg',
      tagList: ['Illustration'],
      fullDescription: '',
      createdAt: '1722091716231',
      updatedAt: '1722091716231',
      shortDescription:
        'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
    },
    {
      id: '3',
      title: '36 Days of Malayalam type',
      thumbnailUrl:
        'https://res.cloudinary.com/dkbq0asaw/image/upload/v1722149823/thumnail1_vcp4gw.jpg',
      tagList: ['Typography'],
      fullDescription: '',
      createdAt: '1722091716231',
      updatedAt: '1722091716231',
      shortDescription:
        'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.',
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
