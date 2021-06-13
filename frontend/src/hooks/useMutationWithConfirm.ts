import { AxiosError } from 'axios'
import { MutationFunction, useMutation, useQueryClient } from 'react-query'
import useSnackbar from './useSnackbar'

export interface Options<T, R, D> {
  successMessage?: string
  onSuccess?: (data: D, variables: R) => void
  errorMessage?: string
  onError?: (error: AxiosError, variables: R) => void
  onSettled?: (
    data: D | undefined,
    error: AxiosError | null,
    variables: R,
  ) => void
  invalidate: string | string[]
  newData?: (reqParam: R, previousData: T) => T
}
const useMutationWithConfirm = <T, R, D>(
  request: MutationFunction<T, R>,
  {
    successMessage = 'Success!',
    errorMessage = 'Something wents wrong :(',
    invalidate,
    onSuccess,
    onError,
    onSettled,
    newData,
  }: Options<D, R, T>,
) => {
  const { showError, showSuccess } = useSnackbar()
  const queryClient = useQueryClient()
  const mutation = useMutation(request, {
    // When mutate is called:
    onMutate: async (reqParam) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(invalidate)

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<D>(invalidate)
      // Optimistically update to the new value
      if (previousData && newData) {
        const nextData = newData(reqParam, previousData)
        queryClient.setQueryData<D>(invalidate, nextData)
      }

      return { previousData }
    },
    onSuccess: (newData, variables) => {
      invalidate && queryClient.invalidateQueries(invalidate)
      successMessage && showSuccess(successMessage)
      onSuccess && onSuccess(newData, variables)
    },
    onError: (error: AxiosError, variables) => {
      errorMessage && showError(error?.response?.data?.error || errorMessage)
      onError && onError(error, variables)
    },
    // Always refetch after error or success:
    onSettled: (data, error, variables) => {
      invalidate && queryClient.invalidateQueries(invalidate)
      onSettled && onSettled(data, error, variables)
    },
  })
  return mutation
}

export default useMutationWithConfirm
