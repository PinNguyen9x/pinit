import { MainLayout } from '@/components/layouts'
import { WorkForm } from '@/components/work'
import { useAddWork, useWorkDetails } from '@/hooks'
import { getErrorMessage } from '@/utils'
import { Box, Container, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { toast } from 'react-toastify'

export interface AddEditWorkPageProps {}

export default function AddEditWorkPage(props: AddEditWorkPageProps) {
  const router = useRouter()
  const { workId } = router.query || {}
  const isAddMode = workId === 'add'
  const { data: workDetails, updateWork } = useWorkDetails({
    workId: (workId as string) || '',
    enabled: router.isReady && !isAddMode,
  })
  const addNewWork = useAddWork()
  const handleSubmit = async (payload: FormData) => {
    try {
      let newWork = null
      if (isAddMode) {
        newWork = await addNewWork(payload)
        toast.success(`Add success!, ${newWork?.id}`)
      } else {
        newWork = await updateWork(payload)
        toast.success('Update success!')
      }
      router.push(`/works/${newWork?.id}/details`)
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    }
  }
  return (
    <Box>
      <Container>
        <Typography component="h1" variant="h5" mt={8} mb={4}>
          {isAddMode ? 'Add new work' : `Edit work #${workId}`}
        </Typography>
        <Box>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minus porro amet quam sequi
          quia, delectus error voluptas voluptatem explicabo. Laborum molestiae modi similique,
          nostrum voluptates sit blanditiis adipisci nobis. Ipsa?
        </Box>
        <Box>
          {(isAddMode || !!workDetails) && (
            <WorkForm initialValues={workDetails} onSubmit={handleSubmit} />
          )}
        </Box>
      </Container>
      <Script src="https://widget.cloudinary.com/v2.0/global/all.js" strategy="afterInteractive" />
    </Box>
  )
}

AddEditWorkPage.Layout = MainLayout
AddEditWorkPage.requireLogin = true
