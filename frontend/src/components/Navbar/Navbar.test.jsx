import { render } from '@testing-library/react'
import { Navbar } from './Navbar'

describe('Navbar', () => {
  it('Navbar should render successfully', () => {
    const { baseElement } = render(<Navbar />)

    expect(baseElement).toBeTruthy()
  })
})
