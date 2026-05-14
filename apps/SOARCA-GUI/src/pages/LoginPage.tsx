import { HelpCircle, KeyRound, LockKeyholeOpen, ShieldCheck } from "lucide-react";
import styled from "styled-components";

import soarcaBackground from "@/assets/soarca-background.jpg";

import {
  Button,
  ButtonWidth,
  FormContainer,
  FormGroup,
  FormLabel,
  Icon,
  Input,
  Link,
  PageContainer,
  Spacer,
  ThemeVariant,
} from "@/components";

export const LoginPage: React.FC = () => {
  return (
    <PageContainer $backgroundImage={soarcaBackground}>
      <LoginCard>
        <LoginCardHeader>
          <Spacer $gap="md" $align="center" $justify="center">
            <LoginBrand aria-label="NG-SOAR">
              <LoginBrandIcon>
                <Icon $icon={ShieldCheck} />
              </LoginBrandIcon>
              <LoginBrandText>
                <LoginBrandTitle>NG-SOAR</LoginBrandTitle>
                <LoginBrandSubtitle>NG-SOC Console</LoginBrandSubtitle>
              </LoginBrandText>
            </LoginBrand>
          </Spacer>
        </LoginCardHeader>
        <LoginCardBody>
          <FormContainer>
            <FormGroup>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input id="email" type="email" placeholder="you@example.com" />
            </FormGroup>
            <FormGroup>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input id="password" type="password" placeholder="••••••••" />
            </FormGroup>
            <Button
              type="submit"
              $variant={ThemeVariant.Primary}
              $width={ButtonWidth.Full}
            >
              Log in
            </Button>
            <Button
              type="button"
              $variant={ThemeVariant.Primary}
              $width={ButtonWidth.Full}
            >
              <Icon $icon={LockKeyholeOpen} />
              Log in with OIDC
            </Button>
          </FormContainer>
        </LoginCardBody>
        <LoginCardFooter>
          <Spacer
            $direction="horizontal"
            $align="center"
            $justify="space-between"
          >
            <Link $to="/forgot-password" $variant="subtle">
              <Icon $icon={KeyRound} />
              Forgot password
            </Link>
            <Link $to="/help" $variant="subtle">
              <Icon $icon={HelpCircle} />
              Help
            </Link>
          </Spacer>
        </LoginCardFooter>
      </LoginCard>
    </PageContainer>
  );
};

const LoginCard = styled.div`
  width: 100%;
  max-width: 28rem;
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.radius.lg};
  border-top: 1px solid transparent;

  margin: 0 auto;
  box-shadow: ${({ theme }) => theme.shadows.base};

  overflow: hidden;
`;

const LoginCardHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: ${({ theme }) => theme.spacing["3xl"]} ${({ theme }) => theme.spacing.xl};
`;

const LoginBrand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const LoginBrandIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme }) => theme.colors.primary.text};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.palette.primary},
    ${({ theme }) => theme.colors.palette.secondary}
  );
`;

const LoginBrandText = styled.div`
  min-width: 0;
`;

const LoginBrandTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.h2.font};
  line-height: 1.1;
`;

const LoginBrandSubtitle = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font: ${({ theme }) => theme.typography.small.font};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const LoginCardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const LoginCardFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  padding: ${({ theme }) => theme.spacing.xl};
`;
