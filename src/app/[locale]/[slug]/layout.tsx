import { SlugLayoutClient } from './_layout-client';

type Props = {
    children: React.ReactNode;
};

export default function SlugLayout({ children }: Props) {
    return <SlugLayoutClient>{children}</SlugLayoutClient>;
}
