import { useTagList } from '@/hooks'
import { WorkFilterPayload } from '@/models'
import { Search } from '@mui/icons-material'
import { Box, debounce, InputAdornment } from '@mui/material'
import { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { AutocompleteField, InputField } from '../form'

export interface WorkFilterProps {
  initialFilter?: WorkFilterPayload
  onSubmit?: (values: WorkFilterPayload) => void
}

export function WorkFilterForm({ initialFilter, onSubmit }: WorkFilterProps) {
  const { data } = useTagList({})
  const tagList = data?.data || []

  const { control, handleSubmit } = useForm<WorkFilterPayload>({
    defaultValues: {
      search: '',
      selectedTagList: [],
      ...initialFilter,
    },
  })
  const handleSearchSubmit = async (payload: WorkFilterPayload) => {
    payload.tagList_like = payload.selectedTagList?.join('|') || ''
    delete payload.selectedTagList
    await onSubmit?.(payload)
  }

  const debounceSearchChange = debounce(handleSubmit(handleSearchSubmit), 350)
  return (
    <Box component="form" onSubmit={handleSubmit(handleSearchSubmit)}>
      <InputField
        name="search"
        placeholder="Search work by title"
        control={control}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search />
            </InputAdornment>
          ),
        }}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          debounceSearchChange()
        }}
      />
      <AutocompleteField
        name="selectedTagList"
        placeholder="Categories"
        control={control}
        label="Filter by category"
        options={tagList}
        getOptionLabel={(option) => option}
        isOptionEqualToValue={(option, value) => option === value}
        onChange={() => debounceSearchChange()}
      />
    </Box>
  )
}
