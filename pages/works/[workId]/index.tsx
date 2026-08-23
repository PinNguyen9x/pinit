import { MainLayout } from '@/components/layouts/main'
import { WorkForm } from '@/components/work'
import { useAddWork } from '@/hooks/use-add-work'
import { useWorkDetails } from '@/hooks/use-work-details'
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
        <Typography variant="body2" color="text.secondary" mb={4}>
          Trường <strong>Full description</strong> nhận Markdown và sơ đồ <code>mermaid</code>, render
          ở trang chi tiết. Viết theo 4 phần để thành case study: Bối cảnh · Vấn đề · Giải pháp ·
          Kết quả. Chỉ nêu số liệu đo được thật.
        </Typography>
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
