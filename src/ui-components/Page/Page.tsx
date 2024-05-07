type Props = { children?: JSX.Element | JSX.Element[]; className?: string }

const PageHeader = ({ children }: Props) => {
    return <header>{children}</header>
}

const PageContent = ({ children }: Props) => {
    return <main>{children}</main>
}

const PageFooter = ({ children }: Props) => {
    return <footer>{children}</footer>
}

export const Page = ({ className, children }: Props) => {
    return <div className={className}>{children}</div>
}

Page.Header = PageHeader
Page.Content = PageContent
Page.Footer = PageFooter
