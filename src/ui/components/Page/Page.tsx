type Props = { children?: JSX.Element | JSX.Element[]; className?: string }

const PageHeader = ({ className, children }: Props) => {
    return <header className={className}>{children}</header>
}

const PageContent = ({ className, children }: Props) => {
    return <main className={className}>{children}</main>
}

const PageFooter = ({ className, children }: Props) => {
    return <footer className={className}>{children}</footer>
}

export const Page = ({ children }: Props) => {
    return <>{children}</>
}

Page.Header = PageHeader
Page.Content = PageContent
Page.Footer = PageFooter

