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

export const Layout = ({ className, children }: Props) => {
    return <div className={className}>{children}</div>
}

Layout.Header = PageHeader
Layout.Content = PageContent
Layout.Footer = PageFooter
