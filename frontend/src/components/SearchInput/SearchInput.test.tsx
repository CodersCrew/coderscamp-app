import React from 'react'
import { render, screen, wait } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { store } from '../../app/store'

import SearchInput from './SearchInput'

describe('SearchInput', () => {
  it('should call onSubmit after user start typing', async () => {
    const onSubmit = jest.fn<string, any>()
    render(
      <Provider store={store}>
        <SearchInput onSubmit={onSubmit} placeholder="Search" />
      </Provider>,
    )
    const input = await screen.getByPlaceholderText('Search')
    const sampleStr: string = 'N'
    userEvent.type(input, sampleStr)
    await wait(() => expect(onSubmit).toBeCalledTimes(1))
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue(sampleStr)
  })
})
