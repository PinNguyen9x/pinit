import { Seo } from '@/components/common'
import { MainLayout } from '@/components/layouts'
import { RecentPost } from '@/components/post'
import { FeatureWork } from '@/components/work/feature-work'
import { Box } from '@mui/material'
import { GetStaticProps } from 'next'
import { NextPageWithLayout, Post, Work } from '../models'
import dynamic from 'next/dynamic'

const HeroSection = dynamic(
  () => import('../components/home/hero').then((mod) => mod.HeroSection),
  {
    ssr: false,
  },
)

interface HomeProps {
  posts?: Post[]
  works?: Work[]
}

const Home: NextPageWithLayout = ({ posts, works }: HomeProps) => {
  return (
    <Box>
      <Seo
        data={{
          title: 'Pin Nguyen | Blog',
          description:
            'Step by step tutorial to build a full CRUD website using NextJs for beginner',
          thumbnailUrl:
            'data:image/png;base64,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',
          url: 'https://pinit-ten.vercel.app/',
        }}
      />
      <HeroSection />
      <RecentPost postList={posts || []} />
      <FeatureWork workList={works || []} />
    </Box>
  )
}

Home.Layout = MainLayout

export const getStaticProps: GetStaticProps<{ posts: Post[]; works: Work[] }> = async () => {
  const [postsResponse, worksResponse] = await Promise.all([
    fetch(`${process.env.API_URL}/api/posts?_page=1&_limit=2`),
    fetch(`${process.env.API_URL}/api/works?_page=1&_limit=3`),
  ])

  const postsData = await postsResponse.json()
  const worksData = await worksResponse.json()

  return {
    props: {
      posts: postsData.data || [],
      works: worksData.data || [],
    },
    revalidate: 60, // ISR: Revalidate every 60 seconds
  }
}

export default Home
