import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsPositive, isString, IsString, ValidateNested } from "class-validator";

export class PaymentSessionDto {

    @IsString()
    orderId: string;
    
    @IsString()
    currency: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => PaySessionItemDto )
    items: PaySessionItemDto[]
}

export class PaySessionItemDto {
    @IsString()
    name: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @IsPositive()
    quantity: number;

}